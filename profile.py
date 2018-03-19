import json
import sys
import itertools
import requests
from threading import Lock
from hsespionage import privatedata
from hsespionage import app
from hsespionage import pgInstance
from hsespionage import oapi
from hsespionage import VICTIMS_PER_USER
from flask import request

killLock = Lock()

def tryKuhn(v, used, matched, edges):
    if v in used:
        return False
    used.add(v)
    for x in edges[v]:
        if x not in matched or tryKuhn(matched[x], used, matched, edges):
            matched[x] = v
            return True
    return False

@app.route("/engine/profile", methods=["GET","POST"])
def profile():
    member = oapi.authOpenAPIMember()
    if member:
        if member["player"]:
            userinfo = pgInstance().one("SELECT dep,name,death_word,secret_word,victims_showed,score,killed_count,killed_list,anon_id,achievements,alive,victims_ids FROM players WHERE vk_id=%(id)s", {'id': member["id"]}, back_as=dict)
            victims = userinfo["victims_ids"]

            victimId = request.form.get("victim_id")

            if request.form.get("death_word") and victimId and 0 <= int(victimId) < VICTIMS_PER_USER:
                recap = requests.post("https://www.google.com/recaptcha/api/siteverify",
                    {"secret": privatedata.recaptchaSecret, "response": request.form.get("recaptcha_response")})
                recap = json.loads(recap.text)

                toBeKilled = pgInstance().one("SELECT death_word, vk_id, victims_ids FROM players WHERE vk_id=%(vid)s", {'vid': str(victims[int(victimId)])}, back_as=dict)

                if recap["success"] and request.form.get("death_word").lower().strip() == toBeKilled["death_word"]:
                    if not userinfo['alive']:
                        return '{"result": "Not in the game"}'

                    with killLock:
                        killed_list = userinfo["killed_list"]
                        killed_list.append(toBeKilled["vk_id"])
                        userinfo["killed_list"] = json.dumps(killed_list)
                        userinfo["score"] += 1 #TODO: score++ -> score += x
                        userinfo["killed_count"] += 1
                        pgInstance().run("UPDATE players SET score=%(score)s, killed_count=%(kc)s, killed_list=%(kl)s WHERE vk_id=%(vid)s", {'score': userinfo["score"], 'kc': userinfo["killed_count"], 'kl': userinfo["killed_list"], 'vid': member["id"]})
                        pgInstance().run("UPDATE players SET alive=false WHERE vk_id=%(vid)s", {'vid': toBeKilled["vk_id"]})

                        victims = [] # victims of the victim
                        for victimid in toBeKilled["victims_ids"]:
                            victims.append(pgInstance().one("SELECT vk_id, name, dep, secret_word FROM players WHERE vk_id=%(vid)s", {'vid': victimid}))
                        killers = pgInstance().all("SELECT vk_id, victims_showed, victims_ids, alive FROM players WHERE (victims_ids ? %(vid)s)", {'vid': toBeKilled["vk_id"]}, back_as=dict)

                        for killer in killers:
                            iof = killer['victims_ids'].index(toBeKilled["vk_id"])
                            del killer['victims_ids'][iof]
                            del killer['victims_showed'][iof]

                        # match killers & victims. Kuhn algo
                        absentEdges = {}
                        for killer in killers:
                            for victim in victims:
                                if victim['vk_id'] not in killer['victims_ids']:
                                    if killer not in absentEdges:
                                        absentEdges[killer] = []
                                    absentEdges[killer].append(victim) # killer -> victim info

                        matched = {} # victim to killer
                        for killer in killers:
                            used = set()
                            tryKuhn(killer, used, matched, absentEdges)

                        if len(matched) != VICTIMS_PER_USER: # TODO: add more than 1 edge?
                            # add an extra edge
                            vc = None
                            for victim in victims:
                                if victim['vk_id'] not in matched.keys():
                                    vc = victim['vk_id']
                                    break
                            kl = None
                            for killer in killers:
                                if killer['vk_id'] not in matched.values():
                                    kl = killer['vk_id']
                                    break
                            matched[vc] = kl

                        for victim, killer in matched.items():
                            killer['victims_ids'].append(victim['vk_id'])
                            killer['victims_showed'].append({"showing_dep": victim['dep'],"showing_secret_word": victim['secret_word'],"showing_name": victim['name']})

                        for killer in killers:
                            pgInstance().run("UPDATE players SET victims_showed=%(vshow)s, victims_ids=%(vids)s WHERE vk_id=%(vid)s", {'vshow': json.dumps(killer['victims_showed'], ensure_ascii=False), 'vids': json.dumps(killer['victims_ids']), 'vid': killer["vk_id"]})
                    return '{"result": "success"}'
                else:
                    return '{"result": "wrong secret word"}'
            else:
                userinfoToReturn = userinfo
                userinfoToReturn["result"] = "success" 
                del userinfoToReturn["victims_ids"]
                del userinfoToReturn["killed_list"]
                return json.dumps(userinfoToReturn)
        else:
            return '{"result": "not a player"}'
    else:
        return '{"result": "no auth"}'
