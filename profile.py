import json
import sys
import time
import logging
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
logging.basicConfig(filename='/var/log/hsk/game.log',level=logging.DEBUG)

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
            userinfo = pgInstance().one("SELECT * FROM players WHERE vk_id=%(id)s", {'id': member["id"]}, back_as=dict)
            victims = userinfo["victims_ids"]

            victimId = request.form.get("victim_id")

            if request.form.get("death_word") and victimId and 0 <= int(victimId) < VICTIMS_PER_USER:
                recap = requests.post("https://www.google.com/recaptcha/api/siteverify",
                    {"secret": privatedata.recaptchaSecret, "response": request.form.get("recaptcha_response")})
                recap = json.loads(recap.text)

                tobekilledId = str(victims[int(victimId)])
                if tobekilledId == '-1':
                    return '{"result": "success"}'
                toBeKilled = pgInstance().one("SELECT name, death_word, vk_id, victims_ids, killed_count, anon_id FROM players WHERE vk_id=%(vid)s", {'vid': tobekilledId}, back_as=dict)

                if recap["success"] and request.form.get("death_word").lower().strip() == toBeKilled["death_word"]:
                    status = pgInstance().one("SELECT value FROM vars WHERE name='status'")
                    if status != "running":
                        return '{"result": "Game not running"}'
                    if not userinfo['alive']:
                        return '{"result": "Not in the game"}'

                    logging.info('{0} ({1}) killed {2} ({3})'.format(userinfo['anon_id'], userinfo['name'], toBeKilled['anon_id'], toBeKilled['name']))

                    with killLock:
                        killed_list = userinfo["killed_list"]
                        killed_list.append(toBeKilled["vk_id"])
                        userinfo["killed_list"] = json.dumps(killed_list)
                        userinfo["score"] += 10 #TODO: score+=10 -> score += x
                        userinfo["killed_count"] += 1
                        currKillTime = time.time()
                        pgInstance().run("UPDATE players SET score=%(score)s, killed_count=%(kc)s, killed_list=%(kl)s, last_kill_time=%(time)s WHERE vk_id=%(vid)s", {'score': userinfo["score"], 'kc': userinfo["killed_count"], 'kl': userinfo["killed_list"], 'time': currKillTime, 'vid': member["id"]})
                        pgInstance().run("UPDATE players SET alive=false WHERE vk_id=%(vid)s", {'vid': toBeKilled["vk_id"]})

                        victims = {} # victims of the victim
                        for victimid in toBeKilled["victims_ids"]:
                            vicInfo = pgInstance().one("SELECT vk_id, name, dep, secret_word FROM players WHERE vk_id=%(vid)s", {'vid': victimid}, back_as=dict)
                            victims[vicInfo['vk_id']] = vicInfo
                        killers = {}
                        for killerInfo in pgInstance().all("SELECT vk_id, victims_showed, victims_ids, alive FROM players WHERE (victims_ids ? %(vid)s) AND alive=true", {'vid': toBeKilled["vk_id"]}, back_as=dict):
                            killers[killerInfo['vk_id']] = killerInfo

                        for vkid, killer in killers.items():
                            iof = killer['victims_ids'].index(toBeKilled["vk_id"])
                            del killer['victims_ids'][iof]
                            del killer['victims_showed'][iof]

                        # match killers & victims. Kuhn algo
                        absentEdges = {}
                        for killerid, killer in killers.items():
                            for victimid, victim in victims.items():
                                if victimid not in killer['victims_ids']:
                                    if killerid not in absentEdges:
                                        absentEdges[killerid] = []
                                    absentEdges[killerid].append(victimid) # killer id -> victim id

                        matched = {} # victim id to killer id
                        for killerid in killers:
                            used = set()
                            tryKuhn(killerid, used, matched, absentEdges)

                        if len(matched) != VICTIMS_PER_USER:
                            logging.warning('Edges problem!')
                            # add an extra edge
                            # TODO: some graph health notifications?
                            vc = None
                            for victimid in victims:
                                if victimid not in matched:
                                    vc = victimid
                                    break
                            kl = None
                            for killerid in killers:
                                if killerid not in matched.values():
                                    kl = killerid
                                    break
                            matched[vc] = kl

                        logging.warning('Rematch: ' + json.dumps(matched))

                        for victimid, killerid in matched.items():
                            killers[killerid]['victims_ids'].append(victimid)
                            killers[killerid]['victims_showed'].append({"showing_dep": victims[victimid]['dep'],"showing_secret_word": victims[victimid]['secret_word'],"showing_name": victims[victimid]['name']})

                        for killer in killers.values():
                            pgInstance().run("UPDATE players SET victims_showed=%(vshow)s, victims_ids=%(vids)s WHERE vk_id=%(vid)s", {'vshow': json.dumps(killer['victims_showed'], ensure_ascii=False), 'vids': json.dumps(killer['victims_ids']), 'vid': killer["vk_id"]})

                        #check gamefinish
                        if len(pgInstance().all("SELECT vk_id FROM players WHERE alive=true")) <= (VICTIMS_PER_USER + 1):
                            logging.info('Game finished')
                            pgInstance().run("UPDATE vars SET value='finished' WHERE name='status'")

                        #achievements
                        if 1 not in userinfo['achievements']: # hat
                            if len(pgInstance().all("SELECT vk_id FROM players WHERE alive=false")) == 1: # TODO: to COUNT()
                                logging.info('New ac: 1')
                                userinfo['achievements'].append(1)
                        if 2 not in userinfo['achievements']: # double
                            if currKillTime - userinfo['last_kill_time'] < 86400: # 24h
                                logging.info('New ac: 2')
                                userinfo['achievements'].append(2)
                        if 3 not in userinfo['achievements']: # rock
                            if toBeKilled['killed_count'] > userinfo['killed_count']:
                                logging.info('New ac: 3')
                                userinfo['achievements'].append(3)
                        pgInstance().run("UPDATE players SET achievements=%(achs)s WHERE vk_id=%(vid)s", {'achs': json.dumps(userinfo['achievements']), 'vid': member["id"]})
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
