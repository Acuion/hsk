from hsespionage import app
from hsespionage import pgInstance
from flask import render_template
from flask import request
from hsespionage import privatedata

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/gamevis") # TODO: protect
def gamevis():
    if 'visiokey' not in request.args or request.args['visiokey'] != privatedata.visiokey:
        return "¯\_(ツ)_/¯"
    labels = [] # id:
    edges = [] # from: to:
    players = pgInstance().all("SELECT * FROM players", back_as=dict)
    for player in players:
        if not player['alive']:
            continue
        labels.append({'id': player['vk_id']})
        for vic in player['victims_ids']:
            edges.append({'from': player['vk_id'], 'to': vic})
    return render_template("vis.html", labels=labels, edges=edges)