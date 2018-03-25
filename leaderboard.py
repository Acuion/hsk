import json
from hsespionage import app
from hsespionage import pgInstance
from flask import request

@app.route("/engine/leaderboard")
def leaderboard():
    leaderboard_data = pgInstance().all(
        "SELECT anon_id, score, achievements, alive FROM players ORDER BY score DESC, last_kill_time ASC, anon_id ASC",
        back_as=dict)
    return json.dumps(leaderboard_data)
