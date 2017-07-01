import collections
import hashlib
import time
from hsespionage_dev import privatedata
from hsespionage_dev import postgresdb
from flask import request

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
        sign = hashlib.md5(sign.encode("utf-8")).hexdigest()

        if session["sig"] == sign and float(session["expire"]) > time.time():
            member = {
                "id": str(session["mid"]),
                "player": (True if postgresdb.one("SELECT vk_id FROM hsspies_game WHERE vk_id={0}".format(repr(session["mid"]))) else False)
            }

    return member
    
