from hsespionage_dev import privatedata
from flask import Flask
from postgres import Postgres

postgresdb = Postgres(privatedata.pgconnectionstring)

app = Flask(__name__)

from hsespionage_dev import index
from hsespionage_dev import leaderboard
from hsespionage_dev import profile
from hsespionage_dev import regvialms