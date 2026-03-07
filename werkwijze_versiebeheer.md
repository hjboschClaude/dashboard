# Werkwijze versiebeheer en kwaliteitsbewaking dashboard

Versie: 1.0
Datum: 7 maart 2026

---

## 1. Doel

Dit document beschrijft hoe het dashboard incrementeel wordt verbeterd, hoe wijzigingen worden vastgelegd en hoe de codekwaliteit periodiek wordt getoetst. Het doel is een herhaalbaar, transparant proces dat voorkomt dat technische schuld ongemerkt groeit.

---

## 2. Versienummering

Het dashboard volgt semantic versioning in de vorm `0.x.y`.

- **0** — het dashboard is in actieve ontwikkeling (pre-1.0). Versie 1.0.0 wordt bereikt als alle vier de sprints uit het technisch implementatieplan zijn afgerond en het beoordelingskader een gemiddelde score van minimaal 7,5 laat zien.
- **x** (minor) — wordt verhoogd bij sprint-afrondingen of structurele wijzigingen die de architectuur, veiligheid of het datamodel raken.
- **y** (patch) — wordt verhoogd bij individuele bugfixes, kleine UI-verbeteringen of cosmetische aanpassingen.

Het startpunt is **v0.9.0** (7 maart 2026). Dit reflecteert dat de functionele feature-set nagenoeg compleet is, maar de technische gezondheid nog niet op productieniveau zit.

### Waar staat het versienummer?

Op twee plekken, die altijd synchroon moeten zijn:

1. In het JavaScript bovenaan het script-blok: `const DASHBOARD_VERSION = '0.9.0';`
2. In de CHANGELOG.md als meest recente entry.

---

## 3. Changelog

Het bestand `CHANGELOG.md` in dezelfde map als het dashboard legt elke wijziging vast. Elke entry bevat:

- **Versienummer** en **datum**
- **Type**: Veiligheid, Architectuur, Performance, UI, Bugfix, Documentatie
- **Omschrijving**: wat is gewijzigd en waarom, in twee à drie regels
- **Domein(en)**: welk domein uit het beoordelingskader codekwaliteit wordt geraakt (optioneel, alleen bij relevante wijzigingen)

### Formaat

```markdown
## v0.9.1 — 2026-03-07

**Type:** Veiligheid
**Domein:** 4.1 Veiligheid (XSS, injectie)

Centrale escapeHtml- en escapeAttr-functies toegevoegd. Alle celrenderers
aangepast om datawaarden te escapen voordat ze in innerHTML worden gezet.
```

### Regels

- Schrijf de changelog-entry direct na het doorvoeren van de wijziging, niet achteraf.
- Eén entry per versienummer. Als een sessie meerdere kleine fixes bevat, groepeer ze onder één patch-versie.
- Gebruik de verleden tijd ("toegevoegd", "verwijderd", "aangepast").

---

## 4. Toetsen aan het beoordelingskader

Het beoordelingskader codekwaliteit (10 domeinen, score 1–10) wordt periodiek toegepast om de voortgang meetbaar te maken. De resultaten worden vastgelegd in `toetshistorie_codekwaliteit.md`.

### Wanneer toetsen?

Er zijn drie toetsmomenten:

1. **Na elke sprint** (verhoging van het minor-versienummer). Dit is verplicht. Scoor alle 10 domeinen opnieuw en leg de delta vast.
2. **Bij een milestone**: als een prioriteit-A-domein substantieel verbetert (bijv. veiligheid van 3 naar 7). Dit is optioneel maar aanbevolen.
3. **Als sanity check**: als een refactoring onverwacht veel code raakt of als er twijfel is over regressie. Dit is situationeel.

### Hoe toetsen?

1. Open het beoordelingskader codekwaliteit en loop de beoordelingsvragen per domein door.
2. Scoor elk domein opnieuw op basis van de huidige code.
3. Noteer per gewijzigde score een korte toelichting (wat is verbeterd, wat resteert).
4. Bereken het nieuwe gewogen gemiddelde.
5. Schrijf de resultaten als nieuwe entry in `toetshistorie_codekwaliteit.md`.

### Formaat toetshistorie

Elke entry bevat een scoretabel, het gemiddelde, het oordeel en een korte samenvatting van wat er is veranderd ten opzichte van de vorige toetsing.

---

## 5. Werkwijze per sessie

Een typische verbeteringssessie verloopt als volgt:

1. **Kies een taak** uit het technisch implementatieplan of de backlog.
2. **Voer de wijziging door** in `dashboard.html`.
3. **Test de wijziging** visueel en functioneel in de browser.
4. **Verhoog het versienummer** in de `DASHBOARD_VERSION`-constante.
5. **Schrijf een changelog-entry** in `CHANGELOG.md`.
6. **Optioneel**: als het een sprint-afronding of milestone betreft, toets aan het beoordelingskader en update `toetshistorie_codekwaliteit.md`.

### Backups

Maak geen kopie van het dashboard bij elke versie — de changelog en toetshistorie zijn voldoende. De enige uitzondering: maak een backup (`dashboard_backup_vX.Y.Z.html`) vóór een grote, risicovolle sprint. Verwijder de backup zodra de sprint succesvol is afgerond.

---

## 6. Overzicht bestanden

| Bestand | Doel |
|---|---|
| `dashboard.html` | Het dashboard zelf, met versienummer in de code |
| `CHANGELOG.md` | Chronologisch logboek van alle wijzigingen |
| `beoordelingskader_codekwaliteit.md` | Toetsinstrument met 10 domeinen en scoremodel |
| `toetshistorie_codekwaliteit.md` | Tijdlijn van toetsresultaten na sprints en milestones |
| `werkwijze_versiebeheer.md` | Dit document — beschrijft het proces |
| `technisch_implementatieplan_codekwaliteit_dashboard.md` | De inhoudelijke taken per sprint |

---

## 7. Criterium voor v1.0.0

Het dashboard bereikt versie 1.0.0 wanneer aan alle volgende voorwaarden is voldaan:

- Alle vier de sprints uit het technisch implementatieplan zijn afgerond.
- Het gemiddelde in het beoordelingskader codekwaliteit is minimaal 7,5.
- Geen enkel domein scoort lager dan 6.
- De domeinen Veiligheid en Testbaarheid scoren minimaal 7.
