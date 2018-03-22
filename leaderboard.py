import json
from hsespionage import app
from hsespionage import pgInstance
from flask import request

@app.route("/engine/leaderboard")
def leaderboard():
    leaderboard_data = pgInstance().all(
        "SELECT anon_id, score, killed_count, alive FROM players ORDER BY score DESC",
        back_as=dict)
    return json.dumps(leaderboard_data)
