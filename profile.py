import json
import sys
import requests
from hsespionage import privatedata
from hsespionage import app
from hsespionage import pgInstance
from hsespionage import oapi
from flask import request

@app.route("/engine/profile", methods=["GET","POST"])
def profile():
    member = oapi.authOpenAPIMember()
    if member:
        if member["player"]:
            userinfo = pgInstance().one("SELECT dep,name,death_word,secret_word,victims_showed,score,killed_count,killed_list,anon_id,achievements,alive,victims_ids FROM hsspies_game WHERE vk_id=%(id)s", {'id': member["id"]}, back_as=dict)
            victims = userinfo["victims_ids"]

            victimId = request.form.get("victim_id")

            if request.form.get("death_word") and victimId and 0 <= int(victimId) < VICTIMS_PER_USER:
                recap = requests.post("https://www.google.com/recaptcha/api/siteverify",
                    {"secret": privatedata.recaptchaSecret, "response": request.form.get("recaptcha_response")})
                recap = json.loads(recap.text)

                toBeKilled = pgInstance().one("SELECT death_word FROM hsspies_game WHERE vk_id=%(vid)s", {'vid': victims[int(victimId)]})

                if recap["success"] and request.form.get("death_word").lower().strip() == toBeKilled["death_word"]:
                    killed_list = userinfo["killed_list"]
                    killed_list.append(toBeKilled["vk_id"])
                    userinfo["killed_list"] = json.dumps(killed_list)
                    userinfo["score"] += 1 #TODO: score++ -> score += x
                    userinfo["killed_count"] += 1
                    pgInstance().run("UPDATE hsspies_game SET score=%(score)d, killed_count=%(kc)d, killed_list=%(kl)s WHERE vk_id=%(vid)s", {'score': userinfo["score"], 'kc': userinfo["killed_count"], 'kl': userinfo["killed_list"], 'vid': userinfo["vk_id"]})
                    
                    victims = []
                    for victimid in toBeKilled["victims_ids"]:
                        victims.append(pgInstance().one("SELECT vk_id, name, dep, secret_word FROM hsspies_game WHERE vk_id=%(vid)s", {'vid': victimid}))
                    killers = pgInstance().all("SELECT vk_id, victims_showed, victims_ids FROM hsspies_game WHERE (victims_ids ? %(vid)s)", {'vid': toBeKilled["vk_id"]}, back_as=dict)
                    
                    for i in range(0, len(killers)):
                        thisVictimPos = killers[i]['victims_ids'].index(toBeKilled["vk_id"])
                        killers[i]['victims_ids'][thisVictimPos] = victims[i]['vk_id'] # replace killed victim with the new one
                        killers[i]['victims_showed'] = {"showing_dep": victims[i]['dep'],"showing_secret_word": victims[i]['secret_word'],"showing_name": victims[i]['name']}
                        pgInstance().run("UPDATE hsspies_game SET victims_showed=%(vshow)s, victims_ids=%(vids)s WHERE vk_id=%(vid)s", {'vshow': json.dumps(killers[i]['victims_showed'], ensure_ascii=False), 'vids': json.dumps(killers[i]['victims_ids']), 'vid': killers[i]["vk_id"]})

                    pgInstance().run("UPDATE hsspies_game SET alive=false WHERE vk_id=%(vid)s", {'vid': toBeKilled["vk_id"]})
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
