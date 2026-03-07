# Design Test Rapport — Dashboard v0.33.0

| | |
|---|---|
| **Dashboard versie** | `0.33.0` |
| **Datum** | 07-03-2026 19:59:47 |
| **Testplan** | TESTPLAN.md |
| **Resultaat** | **GESLAAGD MET WAARSCHUWINGEN** |

---

## Samenvatting

| Suite | ✓ Geslaagd | ✗ Mislukt | △ Waarsch. | ○ Skip |
|---|---:|---:|---:|---:|
| Design (T) | 19 | 0 | 3 | 0 |
| Implementatie (GATE) | 28 | 0 | 2 | 0 |
| Performance (P) | 9 | 0 | 4 | 1 |
| Regressie (RC) | 0 | 0 | 0 | 8 |
| **Totaal** | **56** | **0** | **9** | **9** |

---

## Design (T)

### T1 — Tokens

- ✓ **T1.1 Alle nieuwe tokens aanwezig** — `26 tokens`
- △ **T1.2 Verouderde tokens nog aanwezig** — `--surface2, --surface3, --border-hover, --input-border, --accent2, --accent3, --accent4, --shadow-1, --shadow-2`
- ✓ **T1.3 Token waarden correct** — `7 gecontroleerd`

### T2 — Typografie

- ✓ **T2.1a th font-size: 11px** — `11px`
- ✓ **T2.1b th uppercase**
- ✓ **T2.2 .cell-primary 14px**
- △ **T2.3 Verboden font-sizes** — `16px×7, 13px×23, 9px×25, 22px×6`
- ✓ **T2.4 Geen font-weight 700 op btn/tab**

### T3 — Kleur

- ✓ **T3.1 Geen hardcoded #DCF0F5**
- ✓ **T3.2 Geen hardcoded #EDF8FA**
- ✓ **T3.3 Actieve tab transparante achtergrond**
- ✓ **T3.4 Aggregatierij niet groen**

### T4 — Borders

- ✓ **T4.1 Geen verticale celgrenzen**
- ✓ **T4.2 thead border-bottom ≤ 1px** — `0px`
- ✓ **T4.3 Border-radius ≥ 4px op interactieve elementen**
- ✓ **T4.4 Geen zichtbare .vsep dividers**

### T5 — Spacing

- ✓ **T5.1 Rijhoogte 32px** — `29 rijen`
- ✓ **T5.2 Toolbar hoogte ~40px** — `40px`
- ✓ **T5.3 Panel-header padding symmetrisch** — `L/R: 14px`
- △ **T5.4 Off-grid padding** — `83 waarden (drempel: <5)`

### T7 — Iconen

- ✓ **T7.1 Geen gekleurde emoji in toolbar**
- ✓ **T7.2 Avatars monochroom** — `87 avatars`

## Implementatie (GATE)

### GATE-1 — Token-definitie

- ✓ **Nieuwe tokens aanwezig** — `9 tokens`
- ✓ **Backward-compat aliassen aanwezig**
- ✓ **Stylesheet geladen**

### GATE-2 — Typografie

- ✓ **body font-size: 14px**
- ✓ **thead th: 11px**
- ✓ **thead th: uppercase**
- ✓ **thead th: semibold**
- ✓ **.btn niet 700**
- ✓ **.label-caps klasse in gebruik**

### GATE-3 — Kleur

- ✓ **Geen #DCF0F5 (blauwe hover)**
- ✓ **Geen #EDF8FA (cyaan row-hover)**
- ✓ **Geen #DAF2E8 (groen selected)**
- ✓ **Tab.active: transparante bg**
- ✓ **--row-hover is niet cyaan** — `#E4EEF1`

### GATE-4 — Borders & lijnen

- ✓ **Geen verticale celgrenzen**
- ✓ **thead border-bottom ≤ 1px**
- ✓ **Border-radius ≥ 4px**
- ✓ **.vsep verborgen**

### GATE-5 — Spacing

- ✓ **Rijhoogte 32px**
- ✓ **Toolbar hoogte ~40px** — `40px`
- ✓ **Panel-header padding symmetrisch**
- △ **Off-grid padding** — `51 waarden`

### GATE-6 — Schaduwen & animaties

- ✓ **@keyframes slideOut verwijderd**
- ✓ **Geen zware schaduw-opaciteit (≥ .12)**
- ✓ **--duration-fast aanwezig** — `100ms`
- ✓ **--duration-normal aanwezig** — `150ms`

### GATE-7 — Implementatie voltooid

- ✓ **Geen emoji in toolbar**
- △ **Aliassen nog aanwezig** — `--surface2, --surface3, --border-hover, --input-border, --accent2, --shadow-1, --shadow-2`
- ✓ **Regressie: th uppercase OK**
- ✓ **Regressie: geen td border-left**

## Performance (P)

### P1–P4 — CSS & Typografie metrics

- ✓ **P1 first-paint: 40ms** — `snel`
- ✓ **P1 first-contentful-paint: 40ms** — `snel`
- ✓ **P2a CSS regelcount** — `291 regels`
- ✓ **P2b CSS grootte** — `33.9 KB`
- △ **P3 Design tokens** — `116 (doel: ≤42)`
- △ **P4 Unieke font-sizes** — `9: 9px, 11px, 12px, 13px, 14px, 16px, 18px, 20px, 22px`

### P7–P9 — Runtime metrics

- ✓ **P7a Load tijd** — `16ms`
- ✓ **P7b DOM gereed** — `14ms`
- ✓ **P8 JS heap** — `9.5 MB`
- ✓ **P9a DOM nodes** — `2472 nodes`
- △ **P9b Off-grid padding** — `71 waarden (drempel: <5)`
- △ **P9c Hardcoded kleuren** — `#eff4f6`

### P5–P6 — Interactie-latency

- ✓ **P6 Hover reflow latency** — `0.5ms`
- ○ **P5 Scroll FPS** — `Open DevTools Performance tab → Record → scroll → stop`

## Regressie (RC)

### RC — Handmatige functionele checks

- ○ **RC1 Tabs wisselen** — `Klik op een andere tab — inhoud moet wisselen`
- ○ **RC2 Filters openen** — `Klik Filter → voeg regel toe → Toepassen → tabel filtert`
- ○ **RC3 Kolomsortering** — `Klik kolomheader → sorteerindicator → opnieuw → richting wisselt`
- ○ **RC4 Rijselectie** — `Checkbox rij → groene bg → select-all checkbox → alle geselecteerd`
- ○ **RC5 Contextmenu** — `Rechtsklik rij → menu verschijnt → klik buiten → sluit`
- ○ **RC6 Kolom resize** — `Sleep rechterrand kolomheader → breedte past aan`
- ○ **RC7 Panel animaties** — `Open/sluit filter/kolommen → subtiele fade, geen harde sprong`
- ○ **RC8 Geen console errors** — `Controleer Console tab — geen rode regels`

---

*Gegenereerd door Design Test Runner — Dashboard v0.33.0*