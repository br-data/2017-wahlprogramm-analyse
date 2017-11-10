# Analyse der Wahlprogramme zur Bundestagswahl 2017

Untersuchung der Wahlprogramme zur Bundestagswahl 2017 auf inhaltliche Schwerpunkte und politische Ausrichtung. Grundlage der Auswertung sind alle Wahlprogramme deutscher Parteien mit einem Stimmenanteil von über 5% (nach Umfragen). Die Wahlprogramme wurden automatisiert pro Gliederungspunkt nach politischer Einstellung (links/rechts) und Politikfeld eingeordnet.

Der Einordnung liegt ein Machine-Learning-Algorithmus zugrunde, welcher mit Daten des [Manifesto-Projekt](https://manifestoproject.wzb.eu/) trainiert wurde. Auch das Schema für die Klassifizierung der Wahlprogramme (Domains und Labels), sowie das Schema für die Berechnung der Rechts-Links-Einteilung, wurden von diesem Forschungsprojekt übernommen. Eine Analyse von [BR Data](http://br.de/data) und Felix Bießmann.

- **Artikel**: http://web.br.de/interaktiv/wahlprogramm-analyse-bundestagswahl
- **Paper**: https://arxiv.org/abs/1608.02195

## Manifesto-Projekt

Das [Manifesto-Projekt](https://manifestoproject.wzb.eu/) untersucht Wahlprogramme aus verschiedenen Ländern auf ihre Inhalte und politischen Positionen. Für das Manifesto-Projekt von DFG und WZB codieren Wissenschaftler Wahlprogramme auf Aussagenebene. Jeweils mehrere Manifesto-Codes bilden eine übergeordnete politische Domain.

Domains repräsentieren die großen Politikfelder: External Relations, Freedom and Democracy, Political System, Economy, Welfare and Quality of Life, Fabric of Society, Social Groups. Einzelne Manifesto-Codes können zudem einer linken oder rechten politisch Ausrichtung ([Codebuch, Seite 28](https://manifestoproject.wzb.eu/down/documentation/codebook_MPDataset_MPDS2015a.pdf)) zugeordnet werden.

## Wahlprogramme

Die Wahlprogramme stammen jeweils von der offiziellen Webseite der Parteien (Stand 31. Juli 2017):

- CDU/CSU: https://www.cdu.de/system/tdf/media/dokumente/170703regierungsprogramm2017.pdf?file=1
- SPD: https://www.spd.de/fileadmin/Dokumente/Bundesparteitag_2017/Es_ist_Zeit_fuer_mehr_Gerechtigkeit-Unser_Regierungsprogramm.pdf
- Die Linke: https://www.die-linke.de/fileadmin/download/wahlen2017/wahlprogramm2017/die_linke_wahlprogramm_2017.pdf
- Bündnis 90/Die Grünen: https://www.gruene.de/fileadmin/user_upload/Dokumente/BUENDNIS_90_DIE_GRUENEN_Bundestagswahlprogramm_2017.pdf
- FDP: https://www.fdp.de/sites/default/files/uploads/2017/08/07/20170807-wahlprogramm-wp-2017-v16.pdf
- AfD: https://www.afd.de/wp-content/uploads/sites/111/2017/06/2017-06-01_AfD-Bundestagswahlprogramm_Onlinefassung.pdf

Für die automatisierte Klassifizierung wurden die PDF-Wahlprogramme in das Markdown-Format umgewandelt. Alle Wahlprogramme im Markdown-Format finden sich im Ordner `data/wahlprogramme`.

## Machine-Learning-Klassifizierung

Die Machine Learning Analyse verwendet Python 3.6 und [scikit-learn](http://scikit-learn.org/stable/).

1. Erstellen eines virtualenv im Ordner des github repositories:

```
$ python3.6 -m venv venv
```

2. Aktieren des virtualenvs:

```
$ source venv/bin/activate
```

3. Installieren der Abhänigkeiten:

```
$ pip install -r requirements.txt
```

4. Eigenen API-Key in `manifesto_data.py` hinzufügen ([mehr Infos](https://manifestoproject.wzb.eu/information/documents/api)). Beispiel:

```
$ APIKEY  = "36ef88622dd8955fbf8c2afe9b13c7b2"
```

5. Ausführen der Analysen:

```
$ python br.py
```

Die Ergebnisse werden als Tabelle in `data/resultate/results.csv` gespeichert. Außerdem wird im gleichen Verzeichnis für jede Domain ein Violin-Plot erstellt, der dabei hilft, die Ergebnisse der Klassifizierung auf ihre Plausibilität hin zu überprüfen.

## Analyse und Aggregation

Das Analyse-Skript benötigt mindestens [Node.js v6](https://nodejs.org/en/). Die Abhängigkeiten können mit `npm install` im Ordner `analysis` installiert werden.

Analyse im Ordner `analysis` ausführen. Das Skript benötigt die Ergebnisse der Machine-Learning-Klassifizierung aus der Datei `data/resultate/results.csv`:

```
$ node analyseResults.js
```

Die Ergebnisse der Analyse werden in einer JSON-Datei `analysis/results/results.json` gespeichert. Hier ein Beispiel-Ergebnis für die Metrik **rile_calc**:

```json
"rile_calc": {
  "AfD": -0.25,
  "CDU/CSU": -0.12,
  "FDP": -0.15,
  "SPD": -0.43,
  "Grüne": -0.22,
  "Die Linke": -0.57
}
```

Alle Metriken werden jeweils pro Partei berechnet. Folgende Metriken sind verfügbar (unvollständig):

**left_mean, right_mean**: arithmetisches Mittel aller Links- oder Rechts-Werte.  
**rile_mean**: Differenz des Rechts-Durchschnitts und des Links-Durchschnitts.

**left_median, right_median**: Median aller Links- oder Rechts-Werte.  
**rile_median**: Differenz des Rechts-Medians und des Links-Medians.

**left_stddev, right_stddev**: Standardabweichung der Links- oder Rechts-Werte.

Die Berechnungen des arithmetischen Mittels und des Medians sind auch jeweils als gewichteter Mittelwert verfügbar (**weighted_mean**, **weighted_median**).

**left_calc, right_calc**: Anzahl der Paragraphen, welche nach Manifesto-Definition ([Codebuch, Seite 28](https://manifestoproject.wzb.eu/down/documentation/codebook_MPDataset_MPDS2015a.pdf)) rechts oder links sind.  
**rile_calc**: Differenz der Summe aller rechten Paragraphen und der Summe alle linken Paragraphen geteilt durch die Anzahl aller Paragraphen (Σ rechts -  Σ links / Σ rechts + Σ links)

**max_domain**: Anzahl der Paragraphen, die einer Domäne (Maximum) zugeordnet wurden.  
**max_manifesto**: Anzahl der Paragraphen, die einem Manifesto-Code (Maximum) zugeordnet wurden.  
**max_leftright**: Anzahl der Paragraphen, die dem Label `left` ODER `right` (Maximum) zugeordnet wurden.

**max_domain_left, max_domain_right**: Durchschnitt aller Links- ODER Rechts-Werte pro Domäne.  
**max_domain_rile**: Differenz der durchschnittlichen Rechts-Werte und der durchschnittlichen Links-Werte pro Domäne.

**max_domain_max_left, max_domain_max_right**: Anzahl der Paragraphen, die dem Label `left` ODER `right` (Maximum) UND einem Manifesto-Code zugeordnet wurden.  
**max_domain_max_rile**: Differenz der Anzahl aller Paragraphen mit `max_leftright=left` UND `max_domain=*` und aller Paragraphen mit `max_leftright=right` UND `max_domain=*`. Diese Metrik ist allerdings recht schwierig, da das Sample pro Partei und pro Domäne teilweise recht klein ist und extreme Ergebnisse liefert.

## Historische Werte zum Vergleich

Die historischen RILE-Werte (2002 bis 2013) werden in einem R-Skript berechnet. Die Daten des Manifesto Projekts werden über die Bibliothek [manifestoR](https://cran.r-project.org/web/packages/manifestoR/index.html) geladen. 

## Visualisierung und inhaltliche Auswertung

Eine Visualisierungen der Ergebnisse findet sich in `analysis/charts/index.html`. Die unterschiedlichen Visualisierungen verwenden die JavaScript Bibliothek [D3](https://d3js.org/) und sind eher für die Exploration der Daten gedacht. Die finale Version der Auswertung findet sich [hier](http://web.br.de/interaktiv/wahlprogramm-analyse-bundestagswahl).
