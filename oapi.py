from hsespionage import privatedata
from hsespionage import postgresdb
from flask import request
from string import Template
import collections
import hashlib
import time

def authOpenAPIMember():
    session = {}
    member = {}
    valid_keys = ("expire", "mid", "secret", "sid", "sig")
    app_cookie = request.cookies.get("vk_app_5170996")
    if app_cookie:
        session_data = app_cookie.split("&", maxsplit=10)

        for pair in session_data:
            key, value = pair.split("=", maxsplit=2)
            if (not key) or (not value) or (key not in valid_keys):
                continue
            session[key] = value

        for key in valid_keys:
            if key not in session:
                return member

        session = collections.OrderedDict(sorted(session.items()))

        sign = ""
        for key, value in session.items():
            if key != "sig":
                sign += (key + "=" + value)
        sign += privatedata.vksecretkey
        sign = hashlib.md5(sign)

        if session["sig"] == sign and session["expire"] > time.time():
            member = {
                "id": int(session["mid"]),
                "secret": session["secret"],
                "sid": session["sid"],
                "player": (True if postgresdb.one(Template("SELECT vk_id FROM hsspies_game WHERE vk_id='$vk_id'").substitute(
                    vk_id=postgresdb.string.escape_literal(session["mid"]))) else False)
            }

    return member
    