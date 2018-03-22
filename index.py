import time
import datetime
from hsespionage import app
from hsespionage import pgInstance
from flask import render_template

@app.route("/")
def index():
    until = pgInstance().one("SELECT value FROM vars WHERE name='timer'")
    val = int(datetime.datetime.strptime(until, "%d.%m.%Y %H:%M:%S").timestamp() - time.time())
    if val < 0:
        val = 0
    return render_template("index.html", timerValue=val)
