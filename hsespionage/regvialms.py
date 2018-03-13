import random
import requests
import os
from hsespionage import app
from hsespionage import pgInstance
from hsespionage import oapi
from flask import request

@app.route("/engine/regvialms", methods=['POST'])
def registration():
    member = oapi.authOpenAPIMember()
    lmsl = request.form.get("lmslogin").strip()
    lmsp = request.form.get("lmspassw")
    anonid = request.form.get("anonid")[:14]

    if lmsl and lmsp and anonid and member:
        vkid = member["id"]
        alreadyExists = pgInstance().one("SELECT vk_id FROM hsspies_game WHERE lms_login={0}".format(repr(lmsl)))

        if member["player"] or alreadyExists:
          return '{"result": "УЖЕ ЗАРЕГИСТРИРОВАН"}'
        else:
          authSession = requests.Session()
          authSession.post("http://lms.hse.ru/index.php", data = {"_qf__login_form" : "", "user_login" : lmsl, "user_password" : lmsp, "userLogin" : "Войти"})
          toProc = authSession.get("http://lms.hse.ru/student.php?ctg=personal&op=account").text

          try:
            toProc.index("Группа пользователей")
          except ValueError:
            return '{"result": "НЕВЕРНЫЕ ДАННЫЕ LMS"}'
          
          dep = toProc[toProc.index("Группа пользователей"):]
          dep = find_between(dep, 'value="', '"')
          if dep == "Н НН БИиПМ 15 ПИ" or dep == "Н НН БИиПМ 15 ПМИ": #TODO
            isAnonidTaken = pgInstance().one("SELECT vk_id FROM hsspies_game WHERE anon_id={0}".format(repr(anonid)))
            
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

              dummyVictim = '[{"showing_dep": "some department","showing_secret_word": "so secret","showing_name": "Name Name Name","vk_id": "50858155"},{"showing_dep": "some department","showing_secret_word": "so secret","showing_name": "Name Name Name","vk_id": "50858155"}]'
              pgInstance().run("INSERT INTO hsspies_game values({0}, '{1}', '{2}', '{3}', '{4}', '{5}', {7}, 0, 0, '[]', {6}, '[]', true)".format(repr(lmsl), dep, vkid, name, deathWord, secretWord, repr(anonid), repr(dummyVictim)))
          
              return '{"result": "УСПЕШНАЯ РЕГИСТРАЦИЯ"}'
          else:
            return '{"result": "РЕГИСТРАЦИЯ НЕВОЗМОЖНА"}'
    else:
        return '{"result": "НЕДОСТАТОЧНО ДАННЫХ"}'

def find_between(s, start, end):
  return (s.split(start))[1].split(end)[0] #TODO: it is horrible now, but works D:
