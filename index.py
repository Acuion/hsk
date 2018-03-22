from hsespionage import app
from hsespionage import pgInstance
from flask import render_template

@app.route("/")
def index():
    return render_template("index.html")
