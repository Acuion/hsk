import json
from hsespionage import app
from hsespionage import pgInstance
from flask import request

@app.route("/engine/leaderboard")
def leaderboard():
    leaderboard_data = pgInstance().all(
        "SELECT anon_id, score, killed_count, alive FROM hsspies_game ORDER BY score DESC",
        back_as=dict)
    if request.args.get("count"):
        return str(len(leaderboard_data))
    else:
        return json.dumps(leaderboard_data)
