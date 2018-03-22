from flask import request
from flask import render_template
from hsespionage import app
from hsespionage import privatedata
from hsespionage import pgInstance

@app.route("/gamevis")
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