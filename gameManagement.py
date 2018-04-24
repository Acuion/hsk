import random
import json
from hsespionage import pgInstance
from hsespionage import VICTIMS_PER_USER

def spawnDummies(count):
    for i in range(count):
        pgInstance().run("INSERT INTO players values(%(lmsl)s, 'dep', %(vkid)s, %(name)s, 'dummy', 'dummy', '[]', 0, 0, '[]', %(anonid)s, '[]', true, '[]')", {'lmsl': 'dummy' + str(i), 'vkid': str(i), 'name': 'dummy' + str(i), 'anonid': 'dummy' + str(i)})

def initGame():
    players = pgInstance().all("SELECT * FROM players WHERE lms_login NOT LIKE 'dummy%'", back_as=dict)
    random.shuffle(players)
    for i in range(len(players)):
        victimIds = []
        victimDescs = []
        for j in range(1, VICTIMS_PER_USER + 1):
            vc = players[(i + j) % len(players)]
            victimIds.append(vc['vk_id'])
            victimDescs.append({"showing_dep": vc['dep'],"showing_secret_word": vc['secret_word'],"showing_name": vc['name']})
        pgInstance().run("UPDATE players SET victims_showed=%(victimDescs)s, score=0, killed_count=0, killed_list='[]', achievements='[]', alive=true, victims_ids=%(victimIds)s, last_kill_time=0 WHERE vk_id=%(vid)s", {'victimDescs': json.dumps(victimDescs, ensure_ascii=False), 'victimIds': json.dumps(victimIds), 'vid': players[i]['vk_id']})
    pgInstance().run("UPDATE vars SET value='running' WHERE name='status'")

def finishGame():
    pgInstance().run("UPDATE vars SET value='finished' WHERE name='status'")

def resetPlayers():
    dummyVictims = []
    dummyVictimsIds = []
    for i in range(0, VICTIMS_PER_USER):
        dummyVictimsIds.append(-1)
        dummyVictims.append({"showing_dep": "Игра ещё не началась","showing_secret_word": "00"+str(i),"showing_name": "Джеймс Бонд Петрович"})
    players = pgInstance().all("SELECT * FROM players", back_as=dict)
    for player in players:
        pgInstance().run("UPDATE players SET victims_showed=%(victimDescs)s, score=0, killed_count=0, killed_list='[]', achievements='[]', alive=true, victims_ids=%(victimIds)s, last_kill_time=0 WHERE vk_id=%(vid)s", {'victimDescs': json.dumps(dummyVictims, ensure_ascii=False), 'victimIds': json.dumps(dummyVictimsIds), 'vid': player['vk_id']})
    pgInstance().run("UPDATE vars SET value='register' WHERE name='status'")
