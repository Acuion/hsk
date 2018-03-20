import random
import requests
import os
import json
from hsespionage import app
from hsespionage import pgInstance
from hsespionage import oapi
from hsespionage import VICTIMS_PER_USER
from flask import request

@app.route("/engine/regvialms", methods=['POST'])
def registration():
    member = oapi.authOpenAPIMember()
    lmsl = request.form.get("lmslogin").strip()
    lmsp = request.form.get("lmspassw")
    anonid = request.form.get("anonid")[:14]

    if lmsl and lmsp and anonid and member:
        vkid = member["id"]
        alreadyExists = pgInstance().one("SELECT vk_id FROM players WHERE lms_login=%(lmsl)s", {'lmsl': lmsl})

        if member["player"] or alreadyExists:
          return '{"result": "УЖЕ ЗАРЕГИСТРИРОВАН"}'
        else:
          authSession = requests.Session()
          authSession.post("https://lms.hse.ru/index.php", data = {"_qf__login_form" : "", "user_login" : lmsl, "user_password" : lmsp, "userLogin" : "Войти"})
          toProc = authSession.get("https://lms.hse.ru/student.php?ctg=personal&op=account").text

          try:
            toProc.index("Группа пользователей")
          except ValueError:
            return '{"result": "НЕВЕРНЫЕ ДАННЫЕ LMS"}'
          
          dep = toProc[toProc.index("Группа пользователей"):]
          dep = find_between(dep, 'value="', '"')
          if str.startswith(dep, "Н НН"): #TODO
            isAnonidTaken = pgInstance().one("SELECT vk_id FROM players WHERE anon_id=%(anonid)s", {'anonid': anonid})
            
            if isAnonidTaken:
              return '{"result": "ПСЕВДОНИМ ЗАНЯТ"}'
            else:
              secretWord = random.choice(open(os.path.join(os.path.dirname(__file__), "fishes.txt"), encoding="UTF-8").readlines()) + " " + str(random.randint(10, 99))

              alpG = ('у', 'е', 'ы', 'а', 'о', 'э', 'я', 'и', 'ю')
              alpS = ('й', 'ц', 'к', 'н', 'ш', 'щ', 'з', 'х', 'ф', 'в', 'п', 'р', 'л', 'д', 'ж', 'ч', 'с', 'м', 'т', 'б')
              deathWord = random.choice(alpG) + random.choice(alpS) + random.choice(alpG) + random.choice(alpS) + random.choice(alpG) + random.choice(alpS)

              fname = find_between(toProc, 'name="surname" type="text" value="', '"')
              sname = find_between(toProc, 'name="name" type="text" value="', '"')
              oname = find_between(toProc, 'name="second_name" type="text" value="', '"')
              name = fname + ' ' + sname + ' ' + oname

              dummyVictims = []
              dummyVictimsIds = []
              for i in range(0, VICTIMS_PER_USER):
                dummyVictimsIds.append(-1)
                dummyVictims.append({"showing_dep": "Группа","showing_secret_word": "00"+str(i),"showing_name": "Джеймс Бонд Петрович"})
              dummyVictims = json.dumps(dummyVictims, ensure_ascii=False)
              dummyVictimsIds = json.dumps(dummyVictimsIds)
              pgInstance().run("INSERT INTO players values(%(lmsl)s, %(dep)s, %(vkid)s, %(name)s, %(deathWord)s, %(secretWord)s, %(dummyVictims)s, 0, 0, '[]', %(anonid)s, '[]', true, %(dummyVictimsIds)s)", {'lmsl': lmsl, 'dep': dep, 'vkid': vkid, 'name': name, 'deathWord': deathWord, 'secretWord': secretWord, 'dummyVictims': dummyVictims, 'anonid': anonid, 'dummyVictimsIds': dummyVictimsIds})
          
              return '{"result": "УСПЕШНАЯ РЕГИСТРАЦИЯ"}'
          else:
            return '{"result": "РЕГИСТРАЦИЯ НЕВОЗМОЖНА"}'
    else:
        return '{"result": "НЕДОСТАТОЧНО ДАННЫХ"}'

def find_between(s, start, end):
  return (s.split(start))[1].split(end)[0] #TODO: it is horrible now, but works D:
