from hsespionage import privatedata
from flask import Flask
from postgres import Postgres

postgresdb = Postgres(privatedata.pgconnectionstring)

app = Flask(__name__)

from hsespionage import index
from hsespionage import leaderboard
from hsespionage import profile

