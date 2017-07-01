import json
from string import Template
import requests
from hsespionage import app
from hsespionage import postgresdb
from hsespionage import oapi
from flask import request

@app.route("/engine/regvialms")
def registration():
    member = oapi.authOpenAPIMember()
    lmsl = postgresdb.string.escape_literal(request.form.get("lmslogin")).strip()
    lmsp = request.form.get("lmspassw")
    anonid = request.form.get("anonid").substring(0, 14)

    if lmsl and lmsp and anonid and member:
        
    else:
        return '{"result": "Недостаточно данных"}'