# Taakplan Layer 1 — UX Reference Layer

Versie: 1.0
Datum: 2026-03-08

---

## 1. Doel

Dit taakplan maakt van `ux-reference.html` een **heldere UX Reference Layer**: een normatieve, werkende referentie voor de gewenste dashboard-UX. De patronen uit dit bestand worden later gecontroleerd overgenomen in de Dashboard Engine Layer en komen uiteindelijk via de assembler terecht in tailor-made single-file HTML-dashboards.

**Layer 1 is de bron van waarheid voor hoe dashboards eruitzien en zich gedragen.**

### Relatie tot de platformarchitectuur

| Laag | Bestand | Rol |
|------|---------|-----|
| **→ Layer 1 — UX Reference** | `ux-reference.html` | **Dit plan** |
| Layer 2 — Dashboard Engine | `dashboard.html` | Zie `LAYER2_PLAN.md` |
| Layer 3 — CSV Adapter | Nog niet gebouwd | Zie `ARCHITECTUUR.md` §7 |
| Layer 4 — Dashboard Spec | Nog niet gebouwd | Zie `ARCHITECTUUR.md` §8 |
| Layer 5 — Assembler | Nog niet gebouwd | Zie `ARCHITECTUUR.md` §13 |

---

## 2. Gewenste eindtoestand

Na uitvoering is Layer 1:

- een **werkende reference demo** — interactief, zodat states en gedrag zichtbaar en toetsbaar blijven
- de **bron van waarheid voor UX-patronen** — hintbar, drag preview, drop corridor, kolommenpaneel, undo-toast, keyboard patterns, screenreader announce
- duidelijk gemarkeerd als **niet de production engine**
- opgesplitst in herkenbare secties met PORT THIS / DEMO ONLY labels
- voorzien van porting-richtlijnen naar de Dashboard Engine Layer
- bruikbaar als standaard voor alle toekomstige CSV-gedreven dashboards
- voorzien van een tokenset die compatibel is met de RODS-tokens uit `dashboard.html`

### Niet als doel

- Schaalbare data-engine (→ Layer 2)
- Productievirtualisatie (→ Layer 2)
- CSV parsing (→ Layer 3)
- AI-gegenereerde configuratie (→ Layer 4)
- Single-file build (→ Layer 5)

---

## 3. Scope

### In scope
- Herpositionering van het bestand naar UX reference
- Herstructurering van HTML, CSS en JS in duidelijke secties
- Expliciete scheiding tussen "must port" en "demo only"
- Toevoegen van documentatie in en rond het bestand
- Token-alignment met de RODS-tokenset uit dashboard.html
- Voorbereiden van overdracht naar de Dashboard Engine Layer
- Generiek maken van taal en gebruik voor meerdere dashboards

### Buiten scope
- Engine refactor van dashboard.html (→ `LAYER2_PLAN.md`)
- CSV adapter implementatie (→ Layer 3)
- AI spec generatie (→ Layer 4)
- Bundling naar single-file productie-HTML (→ Layer 5)
- Volledige code modularisatie naar meerdere runtimebestanden

---

## 4. Ontwerpprincipes

1. **Reference, geen engine** — Layer 1 definieert het gewenste UX-gedrag, niet de technische productie-implementatie.
2. **Werkend, maar normatief** — De demo blijft interactief, zodat states en gedrag zichtbaar en toetsbaar blijven.
3. **Portability first** — Alles in Layer 1 moet te vertalen zijn naar hooks of controllers in de Dashboard Engine Layer.
4. **Expliciete scheiding** — Alles wat alleen nuttig is voor de demo moet zichtbaar als zodanig gemarkeerd worden.
5. **Generiek dashboardgedrag** — Niet ontwerpen voor één voorbeeldtabel, maar voor een familie van CSV-gedreven dashboards.
6. **Token-alignment** — Gedeelde tokens tussen Layer 1 en Layer 2 moeten identiek zijn. Layer 1 mag aanvullende UX-specifieke tokens bevatten (corridor, preview, panel).

---

## 5. Huidige staat van `ux-reference.html`

| Aspect | Status | Detail |
|--------|--------|--------|
| Bestandsnaam | ✅ | Heet al `ux-reference.html` |
| `<title>` | ✅ | "Dashboard UX Reference — CSV Dashboard Template Platform" (WP1, v0.43.0) |
| Hero-titel | ✅ | "Dashboard UX Reference" (WP1, v0.43.0) |
| Chip-badge | ✅ | "UX Reference Layer" (WP1, v0.43.0) |
| Sectie-comments | ✅ | 12 CSS + 17 JS secties (WP2, v0.44.0) |
| PORT THIS / DEMO ONLY | ✅ | Alle secties gelabeld (WP2, v0.44.0) |
| Tokens | ⚠️ | ~30 tokens, andere naamgeving dan RODS-set (42 tokens) |
| Accessibility | ⚠️ | Basis aanwezig (srAnnounce, role=grid, aria-label), geen focus trap |
| Regels | 224 | Compact, goed werkend |

### Token-divergentie

| Categorie | `ux-reference.html` | `dashboard.html` (RODS) |
|-----------|---------------------|-------------------------|
| Semantisch | `--text`, `--muted` | `--text-body`, `--text-muted`, `--text-dim` |
| Kleur | `--danger`, `--success` | `--color-danger`, `--color-info`, `--color-warning` |
| Component | `--header-h`, `--row-h`, `--panel-w`, `--drop-gap` | `--row-height` (niet `--row-h`) |
| Schaduwen | `--shadow-sm/md/lg/xl` (4) | `--shadow-md` (1) |
| Font | DM Sans via Google Fonts CDN | RODS/system-ui stack |

---

## 6. Werkpakketten

### Uitvoeringsvolgorde en afhankelijkheden

```
WP1 ──→ WP2 ──→ WP3 ──→ WP6 ──→ WP10
                   │
                   ├──→ WP4 ──→ WP5
                   │
                   └──→ WP8 ──→ WP9
                                  │
                              WP7 ─┘
                                  │
                              WP11 ──→ WP12
```

| # | Werkpakket | Prioriteit | Afhankelijk van | Status |
|---|-----------|------------|-----------------|--------|
| WP1 | Herpositionering en naamgeving | P1 | — | ✅ v0.43.0 |
| WP2 | Structuur expliciet maken | P1 | WP1 | ✅ v0.44.0 |
| WP3 | Must-port vs. demo-only labelen | P1 | WP2 | ✅ v0.45.0 |
| WP4 | Design tokens isoleren en alignen | P2 | WP3 | ○ Open |
| WP5 | Interaction pattern catalog | P2 | WP4 | ○ Open |
| WP6 | Porting notes naar engine | P1 | WP3 | ✅ v0.46.0 |
| WP7 | Taal en inhoud generieker maken | P3 | WP9 | ○ Open |
| WP8 | Accessibility reference verdiepen | P2 | WP3 | ○ Open |
| WP9 | Toolbar en paneel rationaliseren | P2 | WP8 | ○ Open |
| WP10 | Demo-engine minimaliseren | P1 | WP6 | ○ Open |
| WP11 | Koppeling naar single-file build | P3 | WP10 | ○ Open |
| WP12 | Review en validatie | P3 | WP11 | ○ Open |

---

### WP1 — Herpositionering en naamgeving

**Doel:** Het bestand en de UI duidelijk positioneren als UX-reference.

**Taken:**
1. Update `<title>` naar "Dashboard UX Reference — CSV Dashboard Template Platform"
2. Update hero-titel naar "Dashboard UX Reference"
3. Update hero-beschrijving naar generieke referentietekst
4. Vervang chip "Interactieve demo" door "UX Reference Layer"
5. Voeg bovenaan het bestand een HTML-commentaar developer note toe:
   ```html
   <!-- ═══════════════════════════════════════════════════════
        UX REFERENCE LAYER — CSV Dashboard Template Platform
        Dit bestand is de bron van waarheid voor UX-patronen.
        Het is GEEN production engine. Zie LAYER2_PLAN.md.
        ═══════════════════════════════════════════════════════ -->
   ```

**Acceptatiecriteria:**
- Een nieuwe lezer begrijpt binnen 10 seconden dat dit een UX-reference is
- Nergens in de UI staat nog "demo" zonder "reference" kwalificatie

---

### WP2 — Structuur expliciet maken

**Doel:** De interne opbouw leesbaar maken als design layer.

**Taken:**
1. Voeg sectie-comments toe in CSS:
   - `/* ══ DESIGN TOKENS ══ */`
   - `/* ══ BASE STYLES ══ */`
   - `/* ══ TOOLBAR PATTERNS ══ */`
   - `/* ══ TABLE & HEADER STYLES ══ */`
   - `/* ══ DRAG & DROP STYLES ══ */`
   - `/* ══ OVERLAY PATTERNS ══ */`
   - `/* ══ COLUMN PANEL PATTERNS ══ */`
   - `/* ══ UNDO-TOAST ══ */`
   - `/* ══ ACCESSIBILITY ══ */`
   - `/* ══ RESPONSIVE ══ */`
2. Voeg sectie-comments toe in JS:
   - `// ── DEMO DATA ──`
   - `// ── STATE & HISTORY (DEMO ONLY) ──`
   - `// ── UTILITY FUNCTIONS ──`
   - `// ── REFERENCE INTERACTIONS: Drag & Drop ──`
   - `// ── REFERENCE INTERACTIONS: Keyboard ──`
   - `// ── REFERENCE INTERACTIONS: Column Panel ──`
   - `// ── REFERENCE INTERACTIONS: Undo ──`
   - `// ── REFERENCE INTERACTIONS: Search ──`
   - `// ── DEMO ENGINE (DEMO ONLY) ──`
   - `// ── PORTING NOTES ──`
3. Herorden CSS-blokken zodat gerelateerde styles bij elkaar staan
4. Herorden JS zodat interaction patterns vóór demo-engine komen

**Acceptatiecriteria:**
- Een reviewer kan zonder zoeken de UX states, overlays en demo-only code aanwijzen
- De leesvolgorde is logisch: tokens → patterns → interactions → demo

---

### WP3 — Must-port vs. demo-only labelen

**Doel:** Voorkomen dat demo-implementatie later per ongeluk als production pattern wordt overgenomen.

**Taken:**
1. Label als **`/* PORT THIS */`** of **`// PORT THIS`**:
   - Hintbar met toetsenborduitleg
   - Drag preview (floating column card)
   - Drop overlay + drop corridor
   - Shift states (`shift-left`, `shift-right`)
   - Kolommenpaneel (zoeken, tonen/verbergen, reorder)
   - Undo-toast feedback
   - Keyboard patterns (Shift+←→ verplaats, Enter sorteer, H verberg, ←→ navigeer)
   - Screenreader announce pattern (`srAnnounce`)
   - Focus management (`focusCol`, `flashCol`)
   - Sort indicator

2. Label als **`/* DEMO ONLY */`** of **`// DEMO ONLY`**:
   - `render()` — volledige tabel-rerender
   - `pushHistory()` — snapshot-based undo
   - `shuffleBtn` — demo-actie
   - `resetBtn` — demo-actie (in huidige vorm)
   - Directe mutatie van `columns[]` en `rows[]`
   - `applyDragClasses()` via `querySelectorAll` over hele `tbody`
   - `formatCell()` / `formatCellPlain()` — demo cell renderers
   - Embedded `defaultColumns` en `defaultRows` data

**Acceptatiecriteria:**
- Er is nergens twijfel welke onderdelen als UX-contract gelden en welke alleen als demo dienen
- Elk label bevat een korte toelichting (1 regel)

---

### WP4 — Design tokens isoleren en alignen

**Doel:** Van visuele keuzes herbruikbare tokens maken die compatibel zijn met de RODS-tokenset.

**Taken:**
1. Categoriseer de huidige ~30 tokens:
   - **Kleur:** `--bg`, `--surface`, `--surface-2`, `--border`, `--border-light`, `--text`, `--muted`, `--accent`, `--accent-light`, `--accent-subtle`, `--danger`, `--danger-light`, `--warning`, `--warning-light`, `--success`, `--success-light`
   - **Schaduw:** `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`
   - **Geometrie:** `--radius`, `--radius-lg`, `--header-h`, `--row-h`, `--drop-gap`, `--panel-w`
   - **Timing:** `--transition-fast`, `--transition-med`
2. Align gedeelde tokens met RODS-naamgeving uit `dashboard.html`:
   - `--muted` → `--text-muted`
   - `--danger` → `--color-danger`
   - `--warning` → `--color-warning`
   - `--success` → `--color-success`
   - `--row-h` → `--row-height`
3. Behoud UX-specifieke tokens die Layer 2 niet nodig heeft:
   - `--drop-gap`, `--panel-w`, `--header-h`, `--shadow-lg`, `--shadow-xl`, `--radius-lg`, `--transition-fast`, `--transition-med`
4. Documenteer per token: betekenis, waar gebruikt, of het gedeeld is met Layer 2
5. Voeg in `:root` een comment-blok toe met de token-mapping

**Acceptatiecriteria:**
- Gedeelde tokens zijn identiek benaamd aan RODS-set
- UX-specifieke tokens zijn gedocumenteerd als Layer 1-only
- Een implementator kan de Layer 1 uitstraling reproduceren zonder styles te raden

---

### WP5 — Interaction pattern catalog

**Doel:** De reference niet alleen code laten zijn, maar ook een catalogus van interactiepatronen.

**Taken:**
1. Schrijf per patroon een commentblok met:
   - Doel
   - Trigger (muis/keyboard/programmatisch)
   - Zichtbare state
   - Toegankelijkheidsverwachting
   - Engine-hook (verwijzing naar Layer 2)

2. Documenteer minimaal deze 12 patronen:

   | # | Patroon | Trigger | Engine-hook |
   |---|---------|---------|-------------|
   | 1 | Column drag start | `mousedown`/`dragstart` op th | `beginColumnDrag()` |
   | 2 | Column drag move | `dragover` op th | `updateColumnDrag()` |
   | 3 | Column drag commit | `drop` op th | `commitColumnMove()` |
   | 4 | Column drag cancel | `dragend`/`Escape` | `cancelColumnDrag()` |
   | 5 | Drop corridor tonen | Tijdens drag, bij th boundary | Render adapter: header geometry |
   | 6 | Header shift links/rechts | Tijdens drag, adjacent columns | CSS class via render adapter |
   | 7 | Column panel open/close | Klik "Kolommen" / Escape | `togglePanel()` |
   | 8 | Show all / hide all | Panel buttons | `setAllColumnsVisible()` |
   | 9 | Keyboard reorder | Shift+←→ op focused th | `moveColumn()` |
   | 10 | Hide column | H-toets of hide-button | `hideColumn()` |
   | 11 | Undo feedback | Na elke mutatie | `undo()` + toast |
   | 12 | Screen reader announce | Na elke interactie | `announce()` utility |

**Acceptatiecriteria:**
- Elk UX-patroon is beschrijfbaar zonder naar de demo-engine te verwijzen
- De catalogus dient als contract tussen Layer 1 en Layer 2

---

### WP6 — Porting notes naar Dashboard Engine Layer

**Doel:** Layer 1 voorbereiden op gecontroleerde overdracht naar Layer 2.

**Taken:**
1. Voeg bij elk PORT THIS-patroon een porting-notitie toe:
   ```
   // PORTING NOTE:
   // - Drag preview moet overlay blijven, geen body-clone
   // - Drop corridor moet overlay blijven
   // - Shift states alleen op headers, body-effecten alleen op zichtbare viewport-cellen
   // - Panel-acties schrijven alleen naar columnOrder/hiddenColumns state
   // - Undo-toast hangt aan engine-acties, niet aan DOM-mutaties
   ```

2. Schrijf een mapping-tabel onderaan het bestand als commentaar:

   | Layer 1 element | → Engine hook (Layer 2) |
   |-----------------|------------------------|
   | `drag-preview` | `beginColumnDrag` / `updateColumnDrag` |
   | `drop-corridor` | Header geometry selector |
   | `col-panel` | `setColumnOrder`, `setHiddenColumns` |
   | `undo-toast` | Engine actie callback |
   | `srAnnounce` | `announce()` utility |
   | `keyboard move` | `moveColumn()` actie |
   | `sort toggle` | `toggleSort()` actie |
   | `hide column` | `hideColumn()` actie |

**Afhankelijkheid:** Deze mapping wordt de input voor Layer 2 WP-G (UX controller hooks).

**Acceptatiecriteria:**
- Een engineer kan Layer 1 gebruiken als UX-contract zonder demo-code 1-op-1 te kopiëren
- De mapping is direct bruikbaar voor Layer 2 WP-G implementatie

---

### WP7 — Taal en inhoud generieker maken

**Doel:** Layer 1 geschikt maken als standaard voor meerdere dashboardtypen.

**Taken:**
1. Vervang "Kolommen verplaatsen" door "Dashboard UX Reference"
2. Houd voorbeelddata bruikbaar, maar markeer als `// DEMO DATA — illustratief, niet normatief`
3. Zorg dat labels en helpteksten generiek zijn:
   - "Sleep headers om te herschikken" → OK (al generiek)
   - "6 kolommen · 12 rijen" → OK (al generiek)
4. Overweeg meerdere kolomtypes in de demo-data:
   - Tekst (Project)
   - Status chip (Status)
   - Numeriek (Budget)
   - Voortgangsbalk (Voortgang)
   - Datum (Bijgewerkt)
   - → Huidige set dekt dit al voldoende

**Acceptatiecriteria:**
- De file voelt als UX-reference voor een dashboardplatform, niet als prototype voor één casus

---

### WP8 — Accessibility reference verdiepen

**Doel:** Layer 1 ook normatief maken op toegankelijkheid.

**Taken:**
1. Documenteer welke ARIA-rollen normatief zijn:
   - `role="grid"` op table
   - `role="columnheader"` op th
   - `role="dialog"` op panel
   - `role="status" aria-live="assertive"` op srAnnounce
   - `role="status" aria-live="polite"` op undo-toast
2. Voeg toe wat nog ontbreekt:
   - `aria-sort="ascending|descending|none"` op gesorteerde th
   - Focus return naar trigger bij panel sluiten
   - Focus trap in panel (Tab cycled binnen panel)
3. Documenteer keyboard-contract:
   - `←→` navigeer headers
   - `Shift+←→` verplaats kolom
   - `Enter`/`Space` sorteer
   - `H` verberg kolom
   - `Escape` sluit panel
   - `Ctrl+Z` undo
4. Markeer accessibility-gaps als `// A11Y TODO` voor toekomstige verbetering

**Acceptatiecriteria:**
- Layer 1 maakt niet alleen visueel gedrag, maar ook accessibility-gedrag expliciet
- Keyboard-contract is volledig gedocumenteerd

---

### WP9 — Toolbar en paneel rationaliseren

**Doel:** De reference focussen op standaard dashboardinteractie.

**Taken:**
1. Behoud als reference-patronen:
   - Search box + result count
   - Kolommen-button (panel trigger)
   - Undo-button
2. Markeer als demo-only:
   - Shuffle-button → `// DEMO ONLY — niet opnemen in productie`
   - Reset-button → `// DEMO ONLY — in productie via spec-defaults`
3. Behoud kolommenpaneel volledig als reference:
   - Search in panel
   - Show all / Hide all
   - Toggle per kolom
   - Drag reorder in panel
4. Overweeg: verplaats Shuffle/Reset naar een `<details>` blok met label "Demo tools"

**Acceptatiecriteria:**
- De UI toont alleen patronen die logisch onderdeel zijn van de dashboardstandaard
- Demo-tools zijn visueel ondergeschikt aan reference-patronen

---

### WP10 — Demo-engine minimaliseren

**Doel:** De demo werkend houden, maar minder nadruk geven aan de engine-kant.

**Taken:**
1. Groepeer JS-functies in drie blokken:
   - `// ── REFERENCE INTERACTIONS ──` (drag, keyboard, panel, undo, search)
   - `// ── DEMO DATA & STATE ──` (columns, rows, history, sort)
   - `// ── DEMO RENDER HELPERS ──` (render, formatCell, applyDragClasses)
2. Voeg boven de demo-engine een notitie toe:
   ```javascript
   // ══════════════════════════════════════════════════════
   // DEMO ENGINE — alleen ter ondersteuning van de reference
   // De productie-engine staat in dashboard.html (Layer 2)
   // Zie LAYER2_PLAN.md voor de engine-architectuur
   // ══════════════════════════════════════════════════════
   ```
3. Minimaliseer niet de functionaliteit (demo moet blijven werken), maar minimaliseer de cognitieve nadruk

**Acceptatiecriteria:**
- De reference-functie van het document overheerst duidelijk boven de demo-implementatie
- Demo-engine is in max 10 seconden te lokaliseren en af te bakenen

---

### WP11 — Koppeling naar single-file build

**Doel:** Layer 1 formuleren als bronlaag voor de assembler.

**Taken:**
1. Documenteer welke delen de assembler uit Layer 1 overneemt:
   - Design tokens (`:root` variabelen)
   - Overlay patterns (CSS voor drag-preview, drop-corridor)
   - Header affordances (drag handle, sort button, hide button)
   - Panel patterns (CSS + HTML structuur)
   - Keyboard patterns (event handlers → contracten)
   - Accessibility patterns (ARIA-attributen, announce)
2. Documenteer welke delen **niet** naar builds gaan:
   - Demo data (`defaultColumns`, `defaultRows`)
   - Demo history (`pushHistory`, undo-stack)
   - Demo actions (`shuffle`, `reset`)
   - Demo render (`render()`, `formatCell()`)
3. Schrijf in comments hoe Layer 1 door de assembler geconsumeerd wordt

**Acceptatiecriteria:**
- Layer 1 is bruikbaar als bronlaag voor de toekomstige assembler
- Er is geen ambiguïteit over wat wel/niet meegaat naar productie

---

### WP12 — Review en validatie

**Doel:** Controleren of Layer 1 echt als reference-document werkt.

**Taken:**
1. Review op deze vragen:
   - [ ] Begrijpt een nieuwe lezer direct dat dit een UX-reference is?
   - [ ] Zijn must-port en demo-only overal duidelijk?
   - [ ] Zijn de belangrijkste patterns volledig beschreven?
   - [ ] Zijn design tokens duidelijk en aligned met RODS?
   - [ ] Is de file generiek genoeg voor meerdere dashboards?
   - [ ] Is de engine-porting route duidelijk?
   - [ ] Klopt de mapping Layer 1 → Layer 2?
2. Controleer dat de demo nog volledig functioneert na alle wijzigingen
3. Maak een reviewverslag met bevindingen en restpunten

**Acceptatiecriteria:**
- Alle review-vragen zijn met "ja" beantwoord
- De demo werkt ongewijzigd in Chrome, Firefox en Edge

---

## 7. Versioning

Alle werkpakketten samen vormen **v0.43.0** van het project:
- WP1–WP3 + WP6 + WP10 (P1) → één commit na afronding P1-blok
- WP4–WP5 + WP8–WP9 (P2) → één commit na afronding P2-blok
- WP7 + WP11–WP12 (P3) → één commit na afronding P3-blok

Versienummer wordt **niet** in `ux-reference.html` bijgehouden (geen `DASHBOARD_VERSION`), maar in `docs/CHANGELOG.md`.

---

## 8. Kruisafhankelijkheden met Layer 2

| Layer 1 WP | Levert op | Nodig voor Layer 2 WP |
|------------|-----------|----------------------|
| WP3 | PORT THIS / DEMO ONLY labels | WP-G (UX controller hooks) |
| WP4 | Token-alignment | WP-H (config opschonen) |
| WP5 | Pattern catalog | WP-G (UX controller hooks) |
| WP6 | Porting notes + mapping | WP-G (UX controller hooks) |

**Conclusie:** Layer 1 P1 (WP1–WP3 + WP6 + WP10) moet afgerond zijn **voordat** Layer 2 WP-G begint.

---

## 9. Definition of Done

Layer 1 is "geschikt gemaakt" wanneer:

- [ ] Het document is zichtbaar en inhoudelijk gepositioneerd als UX Reference Layer
- [ ] De belangrijkste UX-patronen zijn als normatieve reference gemarkeerd (PORT THIS)
- [ ] Demo-enginegedrag is expliciet als demo-only gelabeld (DEMO ONLY)
- [ ] Design tokens zijn herkenbaar, gecategoriseerd en aligned met RODS
- [ ] Overdracht naar de engine is beschreven in porting notes
- [ ] Interaction pattern catalog bevat alle 12 patronen
- [ ] Accessibility-contract is gedocumenteerd
- [ ] De reference is generiek genoeg voor meerdere CSV-gedreven dashboards
- [ ] De file kan later dienen als bronlaag voor single-file HTML generatie
- [ ] De demo werkt nog volledig in de browser

---

## 10. Deliverables

| # | Deliverable | WP |
|---|------------|-----|
| 1 | Hernoemd en gepositioneerd Layer 1 bestand | WP1 |
| 2 | Gestructureerde source met sectie-comments | WP2 |
| 3 | PORT THIS / DEMO ONLY labels op alle onderdelen | WP3 |
| 4 | Gedocumenteerde en aligned tokenset | WP4 |
| 5 | Interaction pattern catalog (12 patronen) | WP5 |
| 6 | Porting-mapping Layer 1 → Layer 2 | WP6 |
| 7 | Accessibility-contract en keyboard-contract | WP8 |
| 8 | Opgeschoonde toolbar (demo-tools ondergeschikt) | WP9 |
| 9 | Build-notities voor assembler | WP11 |
| 10 | Reviewverslag | WP12 |
