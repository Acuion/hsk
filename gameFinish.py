from hsespionage import pgInstance

def finishGame():
    pgInstance().run("UPDATE vars SET value='finished' WHERE name='status'")

if __name__ == '__main__':
    finishGame()