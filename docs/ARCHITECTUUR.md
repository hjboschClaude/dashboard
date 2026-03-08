Hieronder staat een compact \*\*architectuurdocument v1\*\* dat je kunt gebruiken als basis om bestand 1, bestand 2, de CSV-laag en de AI-laag naar één samenhangend systeem toe te werken.



\# Architectuurdocument — CSV Dashboard Template Platform



\## 1. Doel en uitgangspunten



Het doel is een templatefamilie te maken waarmee op basis van één of meer CSV-bestanden snel maatwerkdashboards kunnen worden opgebouwd, zonder telkens opnieuw UX, rendering en datastructuur te ontwerpen. Bestand 1 levert daarvoor nu al sterke UX-patronen zoals hintbar, drop corridor, drag preview, kolommenpaneel en undo-toast. Bestand 2 levert nu al de schaalbare runtimebasis met declaratieve `dashboardConfig`, tabs, kolommen, features, exports en defaultinstellingen voor grote datasets.



De kern van de doelarchitectuur is dat elk onderdeel één heldere rol krijgt. UX mag niet meer vermengd zijn met render-engine, CSV-verwerking mag niet meer impliciet in dashboardcode zitten, en generatieve AI mag niet vrij dashboardcode “bedenken”, maar moet binnen vaste contracten alleen de maatwerkconfiguratie genereren.



\## 2. Doelarchitectuur in vier lagen



\### Laag A — UX Reference Layer



Deze laag is gebaseerd op bestand 1 en definieert de standaard voor gedrag en uitstraling. Hieronder vallen de visuele en interactionele patronen zoals drag preview, drop corridor, shift-left/shift-right, hintbar, kolommenpaneel, toetsenbordinteractie en undo-feedback. Deze laag is normatief: zo moet elk dashboard zich gedragen.



\### Laag B — Engine Layer



Deze laag is gebaseerd op bestand 2 en is verantwoordelijk voor schaalbare verwerking en rendering. Hieronder vallen statebeheer, filtering, sortering, grouping, aggregaties, virtualisatie, export en tabbeheer. De bestaande declaratieve configuratie met tabs, kolommen, features, exports en defaults is hiervoor al een goede basis.



\### Laag C — CSV Adapter Layer



Deze nieuwe laag vormt de brug tussen ruwe CSV-bestanden en de engine. Deze laag leest CSV in, normaliseert headers en typen, valideert verplichte velden, en levert een gestandaardiseerd schema plus records aan de engine. In de huidige code is de datasource nog vooral `embedded`; voor het einddoel moet dat uitbreidbaar worden naar echte CSV-bronnen. 



\### Laag D — AI Dashboard Spec Layer



Deze laag genereert per dashboard de maatwerkconfiguratie. De AI gebruikt de UX-standaard, de enginecontracten en het CSV-schema als input en produceert tabstructuur, kolomdefinities, labels, zichtbaarheid, formattering, filters, grouping-defaults en exportinstellingen. De AI maakt dus niet de engine en ook niet de UX, maar de dashboard-specifieke configuratie.



\## 3. Centrale ontwerpregel



De belangrijkste regel van het hele systeem is: \*\*één bron van waarheid per concern\*\*. Bestand 1 is bron van waarheid voor UX-patronen. Bestand 2 is bron van waarheid voor runtime- en rendergedrag. De CSV-adapter is bron van waarheid voor schema en genormaliseerde data. De AI-laag is bron van waarheid voor dashboard-specifieke configuratie. Zodra twee lagen hetzelfde probleem tegelijk oplossen, ontstaat drift.



\## 4. Hoofdcontracten die je eerst moet vastleggen



Voordat je bestanden gaat aanpassen, moet je een formeel contract opstellen voor state, configuratie en interfaces. Minimaal moeten daarin staan:



\* `dashboardConfig`

\* `tabConfig`

\* `dataSource`

\* `columnSchema`

\* `columnOrder`

\* `hiddenColumns`

\* `sortState`

\* `searchState`

\* `groupState`

\* `selectionState`

\* `panelState`

\* `features`

\* `exports`



Bestand 2 bevat hiervan al veel impliciete onderdelen in `dashboardConfig`, met tabs, kolommen, feature flags, exportmogelijkheden en defaults. Dat moet nu de expliciete standaard worden waarop CSV en AI aansluiten.



\## 5. Aanpassing van bestand 1



Bestand 1 moet worden omgevormd van werkende demo naar \*\*UX reference specification\*\*. Het moet werkend blijven, maar de code en documentatie moeten duidelijk maken wat standaardgedrag is en wat alleen demo-engine is. De UX-patronen die behouden en gemarkeerd moeten worden zijn onder meer de hintbar, het kolommenpaneel, de drop overlay met corridor, de drag preview, de screenreader announce-regio en de undo-toast.



De onderdelen die als demo-only gemarkeerd moeten worden zijn de full table rerender, de directe mutatie van `columns` en `rows`, en body-brede class-toepassing bij drag via `querySelectorAll` op `tbody td:nth-child(...)`. Die implementatie is bruikbaar als prototype, maar niet de gewenste productieroute. 



Praktisch moet bestand 1 daarom worden hernoemd, opgesplitst in secties zoals “design tokens”, “interaction patterns”, “overlays”, “panel behavior” en “demo-only logic”, en voorzien worden van comments zoals “PORT THIS” en “DEMO ONLY”.



\## 6. Aanpassing van bestand 2



Bestand 2 moet worden omgevormd van groot dashboardbestand naar \*\*expliciete dashboard engine template\*\*. De al aanwezige declaratieve structuur met tabs, dataSource, kolommen, features en exports blijft daarbij behouden, maar wordt opgesplitst in drie delen: engine core, render adapters en UX controllers.



De engine core beheert data, derived state en performancekritische logica. De render adapters vertalen engine-uitkomsten naar header, body, group view en meta view. De UX controllers verzorgen panelopen/sluiten, kolomverplaatsing, undo, keyboardgedrag en andere interactionele koppelingen met de UX-standaard. Zo voorkom je dat UX-gedrag rechtstreeks in de core belandt.



De header drag-and-drop in bestand 2 moet op termijn niet langer alleen een eigen lokale implementatie blijven, maar een enginehook worden waar de UX-laag op kan aansluiten. De huidige code met `thDragStart`, `thDragEnter`, `thDrop` en invalideren van `header`, `body` en `widths` is daarvoor een goed begin, maar nog niet de definitieve scheiding. 



\## 7. CSV Adapter Layer ontwerpen



De CSV-adapter moet een zelfstandige laag worden, los van bestand 2. Deze laag moet verantwoordelijk zijn voor:



\* CSV lezen

\* delimiterdetectie

\* headernormalisatie

\* type inference

\* datum- en getalparsing

\* null/lege waarde-normalisatie

\* validatie van verplichte velden

\* output van records + schema



De output van deze laag moet geen losse arrays zijn, maar een formeel `datasetContract` met `records`, `schema`, `sourceMeta` en validatiemeldingen. Bestand 2 kan dan datasets consumeren zonder CSV-specifieke details te kennen. 



\## 8. AI Dashboard Spec Layer ontwerpen



De AI-laag moet genereren binnen vaste grenzen. Input voor AI is:



\* UX-standard contract uit bestand 1

\* engine contract uit bestand 2

\* CSV-schema uit de adapterlaag

\* eventueel businessregels of domeinregels



De output van AI is een dashboard-spec, bijvoorbeeld:



\* tabbladen

\* labels

\* kolomvolgorde

\* zichtbaarheid

\* renderers

\* grouping-defaults

\* filtervoorstellen

\* exportinstellingen



Omdat bestand 2 nu al een declaratief configuratiemodel met tabs, columns, features en exports heeft, ligt het voor de hand om AI exact dát formaat te laten vullen of uitbreiden.



\## 9. Synchronisatiemodel tussen de lagen



De lagen gaan pas naadloos aansluiten als je expliciet vastlegt welk UX-element aan welk enginehook en welk configveld gekoppeld is. Bijvoorbeeld:



\* drag preview → UX overlay → gebruikt kolomlabel + voorbeeldwaarden uit engine selector

\* drop corridor → UX overlay → gebruikt headergeometrie uit render adapter

\* kolommenpaneel → UX panel → schrijft naar `columnOrder` en `hiddenColumns`

\* undo-toast → UX feedback → wordt getriggerd door engineactie

\* keyboard column move → UX controller → roept dezelfde engineactie aan als drag-drop



De UX-onderdelen zijn in bestand 1 al duidelijk zichtbaar, terwijl bestand 2 de configuratieve en runtimekant al laat zien. De synchronisatie moet dus niet via kopiëren van code, maar via deze mappings verlopen.



\## 10. Gedeelde design tokens



Om UX echt overdraagbaar te maken, moeten kernwaarden uit bestand 1 worden verheven tot gedeelde tokens. Denk aan:



\* row height

\* header height

\* drop gap

\* radii

\* shadows

\* transition timings

\* focus outline

\* overlay z-indexes

\* panel widths



Bestand 1 bevat deze visuele keuzes nu al in concrete CSS voor drag preview, panel, overlay en corridor. Die moeten worden losgetrokken uit de demo en omgezet in een herbruikbare tokenlaag die ook door bestand 2 wordt gebruikt.



\## 11. Gefaseerd veranderpad



De verstandigste volgorde is deze.



Eerst maak je het architectuurdocument en de contracten. Daarna refactor je bestand 1 naar reference. Vervolgens refactor je bestand 2 naar engine + adapters + controllers. Daarna bouw je de CSV-adapter. Vervolgens definieer je het AI-outputformaat. Pas daarna laat je UX-patronen uit bestand 1 stapsgewijs landen in bestand 2. Die volgorde voorkomt dat UX en engine opnieuw door elkaar lopen.



\## 12. Teststrategie



Elke laag krijgt een eigen testsoort.



De CSV-laag krijgt parsing-, normalisatie- en validatietests. De engine krijgt tests op filtering, sorting, grouping, aggregatie en viewportberekening. De UX-controller krijgt interaction tests voor drag, hide/show, undo en toetsenbordgedrag. De UX reference file wordt gebruikt als visuele en interactionele standaard, niet als primaire datapijplijntest. Bestand 2 is al duidelijk ontworpen voor grote datasets van 4.500 records per tab, dus performance tests horen expliciet bij de enginelaag.



\## 13. Laag E — Assembler Layer (toegevoegd)



De assembler is de vijfde laag die alle bronlagen combineert tot één distributie-artefact: een single-file HTML-dashboard. De vier bronlagen (UX, engine, CSV-adapter, dashboard-spec) zijn inputlagen voor generatie, geen eindproducten.

De assembler is verantwoordelijk voor:

\* alle CSS inline in één `<style>` blok
\* alle JS inline in één `<script>` blok
\* dashboard-spec injecteren als inline JSON configuratie
\* CSV-data of getransformeerde data injecteren als inline dataset
\* design tokens uit UX reference overnemen in `:root`
\* placeholders vervangen
\* optioneel minifyen of opschonen
\* geen runtime-afhankelijkheid van externe bestanden



De single-file eis is een eis aan de buildstrategie, niet aan de bronarchitectuur. De bronnen mogen modulair zijn; het eindproduct moet zelfstandig draaien.



\### 13.1 Doelmappenstructuur



```
dashboard-template-platform/
├── CLAUDE.md
├── docs/
├── src/
│   ├── ux-reference/        # Design tokens, interaction patterns, overlays
│   ├── dashboard-engine/    # AppState, pipeline, renderers, virtual scroll
│   ├── csv-adapter/         # Parsing, typing, schema, validatie
│   ├── dashboard-spec/      # AI-outputformaat, spec-schema, transformaties
│   └── assembler/           # CSS/JS bundelen, config injecteren, minify
├── dashboards/              # Per dashboard: spec.json + CSV-bronbestanden
│   ├── finance-overview/
│   │   ├── dashboard-spec.json
│   │   ├── source/
│   │   │   ├── budget.csv
│   │   │   └── realisatie.csv
│   │   └── build-config.json
│   ├── project-monitor/
│   └── subsidy-dashboard/
├── dist/                    # Geassembleerde single-file HTML dashboards
│   ├── finance-overview.html
│   ├── project-monitor.html
│   └── subsidy-dashboard.html
└── archive/
```



\### 13.2 Generatieproces per dashboard



1. CSV-bestanden aanleveren in `dashboards/{naam}/source/`
2. CSV-adapter genereert genormaliseerde velden, schema en datakwaliteitssignalen
3. Generatieve AI analyseert schema + businessregels → genereert `dashboard-spec.json`
4. Assembler combineert UX reference + engine + data + spec
5. Output: één `dist/{naam}.html`



\## 14. Eindbeeld



De volwassen eindvorm is een platform met vijf duidelijk gescheiden rollen. De UX reference definieert hoe dashboards zich gedragen. De engine voert dashboards schaalbaar uit. De CSV-adapter maakt ruwe bestanden betrouwbaar en uniform. De AI-laag genereert dashboard-specifieke configuratie. De assembler bouwt van alle bronnen één tailor-made HTML-bestand.

De vier bronlagen zijn geen vier eindproducten, maar vier inputlagen voor generatie van het uiteindelijke dashboard.

De keten:

```
UX reference + engine + CSV-adapter + dashboard-spec → assembler → single HTML dashboard
```

De scherpste samenvatting is: \*\*eerst contracten, dan rolzuivere lagen, dan synchronisatie via interfaces, dan assemblage tot single-file distributie.\*\* Dat is de route waarmee alle onderdelen naadloos op elkaar aansluiten en meerdere dashboards op dezelfde basis kunnen worden gegenereerd.



