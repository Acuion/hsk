import random
import json
from hsespionage import pgInstance
from hsespionage import VICTIMS_PER_USER

def spawnDummies(count):
    for i in range(count):
        pgInstance().run("INSERT INTO players values(%(lmsl)s, 'dep', %(vkid)s, %(name)s, 'dummy', 'dummy', '[]', 0, 0, '[]', %(anonid)s, '[]', true, '[]')", {'lmsl': 'dummy' + str(i), 'vkid': str(i), 'name': 'dummy' + str(i), 'anonid': 'dummy' + str(i)})

def initGame():
    players = pgInstance().all("SELECT * FROM players", back_as=dict)
    for player in players:
        player['victims_ids'] = []
        player['victims_showed'] = []
        player['alive'] = True
        player['score'] = 0
        player['killed_count'] = 0
        player['killed_list'] = []
        player['achievements'] = []
    random.shuffle(players)
    for i in range(len(players)):
        victimIds = []
        victimDescs = []
        for j in range(1, VICTIMS_PER_USER + 1):
            vc = players[(i + j) % len(players)] # TODO
            victimIds.append(vc['vk_id'])
            victimDescs.append({"showing_dep": vc['dep'],"showing_secret_word": vc['secret_word'],"showing_name": vc['name']})
        pgInstance().run("UPDATE players SET victims_showed=%(vshow)s, victims_ids=%(vids)s WHERE vk_id=%(vid)s", {'vshow': json.dumps(victimDescs, ensure_ascii=False), 'vids': json.dumps(victimIds), 'vid': players[i]["vk_id"]})

if __name__ == '__main__':
    initGame()