import json
import sys
import requests
from hsespionage_dev import privatedata
from hsespionage_dev import app
from hsespionage_dev import postgresdb
from hsespionage_dev import oapi
from flask import request

@app.route("/engine/profile", methods=["GET","POST"])
def profile():
    member = oapi.authOpenAPIMember()
    if member:
        if member["player"]:
            userinfo = postgresdb.one("SELECT dep,name,death_word,secret_word,victims_data,score,killed_count,killed_list,anon_id,achievements,alive FROM hsspies_game WHERE vk_id={0}".format(repr(member["id"])), back_as=dict)
            victims = userinfo["victims_data"]

            victimId = request.form.get("victim_id")

            if request.form.get("death_word") and victimId and 0 <= int(victimId) <= 1:
                recap = requests.post("https://www.google.com/recaptcha/api/siteverify",
                    {"secret": privatedata.recaptchaSecret, "response": request.form.get("recaptcha_response")})
                recap = json.loads(recap.text)

                toBeKilled = postgresdb.one("SELECT death_word, FROM hsspies_game WHERE vk_id='{0}'".format(victims[int(victimId)]["vk_id"]))

                if recap["success"] and request.form.get("death_word").lower().strip() == toBeKilled["death_word"]:
                    killed_list = userinfo["killed_list"]
                    killed_list.append(toBeKilled["vk_id"])
                    userinfo["killed_list"] = json.dumps(killed_list)
                    userinfo["score"] += 1
                    userinfo["killed_count"] += 1
                    postgresdb.run("UPDATE hsspies_game SET score={0}, killed_count={1}, killed_list='{2}' WHERE vk_id='{3}'".format(userinfo["score"], userinfo["killed_count"], userinfo["killed_list"], userinfo["vk_id"]))
                    #TODO: score++ -> score += x
                    
                    victims = [postgresdb.one("SELECT vk_id, name, dep FROM hsspies_game WHERE vk_id='{0}'".format(toBeKilled["victims_data"][0]["vk_id"])),
                        postgresdb.one("SELECT vk_id, name, dep FROM hsspies_game WHERE vk_id='{0}'".format(toBeKilled["victims_data"][1]["vk_id"]))]
                    killers = postgresdb.all("SELECT vk_id, victims_data FROM hsspies_game WHERE (victims_data->0->'vk_id' ? '{0}') OR (victims_data->1->'vk_id' ? '{0}')".format(toBeKilled["vk_id"]), back_as=dict)
                    #TODO: check it
                    for x in range(0, 2):
                        if killers[x]["victims_data"][0]["vk_id"] == toBeKilled["vk_id"]:          
                            killers[x]["victims_data"][0] = victims[x]
                        else:
                            killers[x]["victims_data"][1] = victims[x]
                        postgresdb.run("UPDATE hsspies_game SET victims_data='{0}' WHERE vk_id='{1}'".format(json.dumps(killers[x]["victims_data"]), killers[x]["vk_id"]))

                    postgresdb.run("UPDATE hsspies_game SET alive=false WHERE vk_id='{0}'".format(toBeKilled["vk_id"]))
                    return '{"result": "success"}'
                else:
                    return '{"result": "wrong secret word"}'
            else:
                userinfoToReturn = userinfo
                userinfoToReturn["result"] = "success" 
                del userinfoToReturn["victims_data"][0]["vk_id"]
                del userinfoToReturn["victims_data"][1]["vk_id"]
                del userinfoToReturn["killed_list"]
                return json.dumps(userinfoToReturn)
        else:
            return '{"result": "not a player"}'
    else:
        return '{"result": "no auth"}'
