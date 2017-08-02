# Wahlprogramm-Analyse
Wahlprogramme zur Bundestagswahl 2017 werden analysiert mit einem Machine Learning Modell, das trainiert wurde auf den Parteiprogrammen aller deutschen Parteien annotiert vom [Manifesto Project](https://manifestoproject.wzb.eu/).

## Installation
Erstellen eines virtualenv im Ordner des github repositories:

  `python3.6 -m venv venv`

Aktieren des virtualenvs:

  `source venv/bin/activate`

Installieren der dependencies:

  `pip install -r requirements.txt`

Eigenen API-Key in `manifesto_data.py` hinzufügen ([mehr Infos](https://manifestoproject.wzb.eu/information/documents/api)). Beispiel:

  `APIKEY  = "36ef88622dd8955fbf8c2afe9b13c7b2"`

Ausführen der Analysen:

  `python br.py`
