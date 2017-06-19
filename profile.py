import json
from string import Template
import requests
from hsespionage import privatedata
from hsespionage import app
from hsespionage import postgresdb
from hsespionage import oapi
from flask import request

@app.route("/engine/profile")
def profile():
    member = oapi.authOpenAPIMember()
    if member:
        if member["player"]:
            userinfo = postgresdb.all(Template("SELECT * FROM hsspies_game WHERE vk_id = '$vk_id'").substitute(
            vk_id=postgresdb.string.escape_literal(member["id"])), back_as=dict)
            victims = json.loads(userinfo['victims_data'])
            
            userinfo["result"] = "success"
            userinfo["victim_name"] = victims[0]["name"]
            userinfo["victim_secret_word"] = victims[0]["secret_word"]
            userinfo["victim_dep"] = victims[0]["dep"] #TODO

            if request.form.get["death_word"]:
                recap = requests.post("https://www.google.com/recaptcha/api/siteverify",
                    {"secret": privatedata.recaptchaSecret, "response": request.form.get("recaptcha_response")})
                recap = json.loads(recap)
                if recap.success and request.form.get("death_word").lower().strip() == victims[0]["death_word"]:
                    killed_list = json.loads(userinfo["killed_list"])
                    killed_list.append(victims[0]["vk_id"])
                    killed_list = json.dumps(killed_list)
                    score = userinfo["score"] + 1 #TODO
                    #TODO
                    #postgresdb.run("UPDATE hsspies_ game SET alive=0, killed_count=$killed_count, score=$score, killed_list='$killed_list', ")
                    return '{"result": "success"}'
                else:
                    return '{"result": "wrong secret word"}'
        else:
            return '{"result": "not a player"}'
    else:
        return '{"result": "no auth"}'
