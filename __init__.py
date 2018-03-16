from hsespionage import privatedata
from flask import Flask
from postgres import Postgres

VICTIMS_PER_USER = 3

def pgInstance():
    return Postgres(privatedata.pgconnectionstring)

app = Flask(__name__)

from hsespionage import index
from hsespionage import leaderboard
from hsespionage import regvialms
from hsespionage import profile
from hsespionage import githubwebhook

from werkzeug.debug import DebuggedApplication
app.debug = True
app.wsgi_app = DebuggedApplication(app.wsgi_app, True)
