# Voorstel: visuele feedback bij verplaatsen van kolommen

## Doel

De gebruiker moet tijdens het verplaatsen van kolommen **direct en soepel** kunnen zien:

1. **welke kolom** wordt verplaatst
2. **waar** die kolom terechtkomt
3. **hoe** de nieuwe positie zich verhoudt tot de bestaande kolommen

Voor dit dashboard-template in één HTML-bestand is de aanbevolen richting een **combinatie van variant 2 en variant 3**:

- **variant 2:** insertiemarker met vrijgemaakte ruimte op de drop-plek
- **variant 3:** ghost header die zichtbaar maakt welke kolom wordt gesleept

Deze combinatie geeft de meeste duidelijkheid zonder dat de interactie te druk of te complex wordt.

---

## Aanbevolen oplossing

### Kern van de interactie

Tijdens het slepen van een kolom worden gelijktijdig vier signalen getoond:

1. de **bronkolom** krijgt een ghost-status
2. een **floating drag preview** laat zien welke kolom wordt verplaatst
3. een **verticale insertiemarker** toont de exacte invoegpositie
4. de **doelzone maakt ruimte**, zodat de nieuwe plek voelbaar wordt

Deze combinatie maakt de interactie veel duidelijker dan alleen een linker- of rechterrand op de targetkolom.

---

## Gewenst gedrag

### 1. Bij start van drag

Wanneer de gebruiker een header begint te slepen:

- de originele header blijft zichtbaar op zijn oude plaats
- de header krijgt een `ghost`-uitstraling
- een kleine floating preview verschijnt bij de cursor

### 2. Tijdens bewegen over mogelijke drop-plekken

Wanneer de gebruiker over andere kolommen beweegt:

- verschijnt een **duidelijke verticale marker** tussen twee kolommen
- schuift de target-zone **8–12 px** op om ruimte te tonen
- blijft de floating preview zichtbaar
- blijft de bronheader ghosted

### 3. Bij loslaten

Wanneer de gebruiker de kolom loslaat:

- verdwijnt de floating preview
- verdwijnt de ghost-status van de bronheader
- verdwijnt de tijdelijke ruimte
- wordt de kolom definitief ingevoegd
- rendert de tabel opnieuw in de nieuwe volgorde

---

## Waarom deze combinatie de beste keuze is

### Wat de gebruiker wil begrijpen

Bij kolomverplaatsing zijn er twee vragen:

- **Wat verplaats ik?**
- **Waar komt het terecht?**

Met alleen een doelmarkering is de tweede vraag deels opgelost, maar blijft de eerste impliciet.
Met alleen een ghost preview weet de gebruiker wat hij sleept, maar niet exact waar het eindigt.

De combinatie lost beide vragen tegelijk op.

### Waarom dit goed past bij dit dashboard

Dit dashboard is:

- data-intensief
- compact opgebouwd
- sterk afhankelijk van precieze tabelinteractie
- bedoeld als template voor meerdere dashboards

Daarom is een oplossing nodig die:

- **duidelijk** is
- **strak** oogt
- **technisch beheersbaar** blijft
- **generiek herbruikbaar** is

De combinatie van ghost + insertieplek + vrijgemaakte ruimte voldoet daar het best aan.

---

## Visueel ontwerpvoorstel

### A. Bronheader

De bronheader blijft staan, maar krijgt tijdens drag:

- opacity: `0.35` tot `0.45`
- lichte schaalverkleining, bijvoorbeeld `scale(0.98)`
- iets neutralere achtergrond
- geen zware schaduw

Doel: zichtbaar maken dat deze kolom “los” is, zonder dat de header uit het ritme van de tabel valt.

### B. Floating drag preview

Een klein zwevend element volgt de cursor:

- toont kolomlabel
- optioneel kolomicoon
- compacte padding
- afgeronde hoeken
- subtiele shadow
- `pointer-events: none`

Doel: de gebruiker blijft visueel vasthouden welke kolom wordt verplaatst.

### C. Insertiemarker

Op de daadwerkelijke invoegpositie verschijnt:

- een verticale lijn van `3px`
- in de accentkleur van het dashboard
- over de volle hoogte van de header
- optioneel met klein top- en bottom-capje

Doel: exact aangeven waar de kolom terechtkomt.

### D. Vrijgemaakte ruimte

De doelzone verschuift licht:

- ongeveer `8–12px`
- naar rechts bij `before`
- naar links bij `after`
- met een snelle overgang van ongeveer `120ms`

Doel: de interface laat letterlijk zien dat daar ruimte ontstaat voor de nieuwe kolom.

---

## Interaction design-principes

### 1. Toon invoegpositie, geen targetblok

De gebruiker moet niet vooral zien **welke kolom actief is als target**,
maar **waar de nieuwe kolom wordt ingevoegd**.

Daarom is een insertiemarker beter dan alleen een gekleurde rand op een header.

### 2. Houd de feedback compact

Geen grote kleurvlakken of drukke animaties.
Dit dashboard vraagt om rustige, precieze feedback.

### 3. Gebruik animatie alleen functioneel

Animatie moet helpen bij begrip:

- korte transitions
- geen springerige layout
- geen volledige live herschikking van alle headers tijdens hover

### 4. Maak bron en doel tegelijk zichtbaar

De interactie is het duidelijkst als de gebruiker tegelijk ziet:

- de bron
- de verplaatste kolom
- de toekomstige plek

---

## Technisch voorstel voor de template

## Gewenste drag-state

Neem in de engine een expliciete `dragState` op, bijvoorbeeld:

```js
const dragState = {
  isActive: false,
  sourceKey: null,
  targetKey: null,
  placement: null, // 'before' | 'after'
  pointerX: 0,
  pointerY: 0
};
```

Doel hiervan is dat zowel de headerweergave, de floating preview als de drop-indicator op dezelfde bron van waarheid werken.

---

## Gewenste CSS-klassen

Gebruik bijvoorbeeld deze klassen:

```css
.th-drag-source {}
.th-drop-before {}
.th-drop-after {}
.th-drop-gap-before {}
.th-drop-gap-after {}
.drag-preview {}
```

### Betekenis

- `th-drag-source`: bronheader in ghost-staat
- `th-drop-before`: invoegpositie vóór de targetkolom
- `th-drop-after`: invoegpositie ná de targetkolom
- `th-drop-gap-before`: ruimte openen vóór target
- `th-drop-gap-after`: ruimte openen ná target
- `drag-preview`: floating ghost element

---

## Gewenst eventmodel

Zowel de kolomlijst als de tabelheader moeten uiteindelijk dezelfde engine-operatie gebruiken:

```js
moveColumnByKey(tabId, sourceKey, targetKey, placement)
```

Daarmee voorkom je dubbele logica in:

- header drag-and-drop
- kolommenpaneel drag-and-drop

De UI verschilt, maar de reorder-operatie blijft gelijk.

---

## Aanbevolen implementatiestappen

### Stap 1
Vervang de huidige eenvoudige linker/rechtermarkering door een echte insertiemarker.

### Stap 2
Voeg een lichte gap-animatie toe op de drop-plek.

### Stap 3
Voeg een floating drag preview toe.

### Stap 4
Centraliseer drag-state in één object.

### Stap 5
Laat zowel header-drag als panel-drag dezelfde reorder-functie gebruiken.

---

## Niet aanbevolen als standaard

Voor dit dashboard-template raad ik de volgende aanpakken niet als eerste keuze aan:

### Volledige live reorder-preview

Alle headers al tijdens hover live laten herschikken is indrukwekkend, maar voor een single-file template te gevoelig voor:

- jitter
- extra complexiteit
- edge cases bij sticky kolommen
- lastiger onderhoud

### Zware target-highlights

Grote gekleurde headerblokken of volle achtergrondvlakken leiden te veel af in een compacte datatabel.

---

## Eindadvies

De beste standaardoplossing voor dit dashboard is:

**een combinatie van ghost header, floating drag preview, insertiemarker en subtiel vrijgemaakte ruimte op de drop-plek.**

Dat geeft de gebruiker het duidelijkste antwoord op beide kernvragen:

- **wat verplaats ik?**
- **waar komt het terecht?**

En tegelijk blijft de oplossing:

- strak genoeg voor een enterprise dashboard
- beheersbaar binnen één HTML-bestand
- generiek genoeg voor een dashboard-template

---

## Besliszin

**Maak de nieuwe plek zichtbaar als echte invoegpositie tussen kolommen, terwijl de gebruiker tegelijk visueel blijft vasthouden welke kolom wordt verplaatst.**
