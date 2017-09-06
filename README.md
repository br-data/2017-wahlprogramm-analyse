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

## Klassifizierung

## Analyse
Das Analyse-Skript benötigt mindestens [Node.js v6](https://nodejs.org/en/). Die Abhängigkeiten können mit `npm install` installiert werden.

Verwendung: Im Ordner `analysis` die Analyse mit `node analyseResults.js` ausführen. Das Skript erzeugt eine Datei `analysis/results/results.json` mit den Ergebnissen.

Alle Metriken werden jeweils pro Partei berechnet:

**left_mean, right_mean**: arithmetisches Mittel aller Links oder Rechts-Werte.  
**rile_mean**: Differenz des Rechts-Durchschnitts und des Links-Durchschnitts.

**left_median, right_median**: Median aller Links oder Rechts-Werte.  
**rile_median**: Differenz des Rechts-Medians und des Links-Medians.

**left_stddev, right_stddev**: Standardabweichung der Links oder Rechts-Werte.

**left_calc, right_calc**: Anzahl der Paragraphen welche nach Manifesto-Definition ([Codebuch, Seite 28](https://manifestoproject.wzb.eu/down/documentation/codebook_MPDataset_MPDS2015a.pdf)) recht oder links sind.  
**rile_calc**: Differenz der Summer aller Rechts-Wert und der Summe alle Links-Werte geteilt durch die Anzahl aller Werte (Σ rechts -  Σ links / Σ rechts + Σ links)

**max_domain**: Anzahl der Paragraphen die einer Domäne (Maximum) zugeordnet wurden.  
**max_manifesto**: Anzahl der Paragraphen die einem Manifesto-Code (Maximum) zugeordnet wurden.  
**max_leftright**: Anzahl der Paragraphen die dem Label `left` ODER `right` (Maximum) zugeordnet wurden.

**max_domain_left, max_domain_right**: Durchschnitt aller Links ODER Rechts-Werte pro Domäne.  
**max_domain_rile**: Differenz der durchschnittlichen Rechts-Werte und der durchschnittlichen Links-Werte pro Domäne.

**max_domain_max_left, max_domain_max_right**: Anzahl der Paragraphen die dem Label `left` ODER `right` (Maximum) UND einem Manifesto-Code zugeordnet wurden.  
**max_domain_max_rile**: Differenz der Anzahl aller Paragraphen mit `max_leftright=left` UND `max_domain=*` und aller Paragraphen mit `max_leftright=left` UND `max_domain=*`. Diese Metrik ist allerdings recht schwierig, da das Sample pro Partei und pro Domäne teilweise recht klein ist und extreme Ergebnisse liefert.

## Charts
Visualisierungen der Ergebnisse findet sich im Ordner `analysis/charts/`
