# Design Test Rapport — Dashboard v0.17.0

| | |
|---|---|
| **Dashboard versie** | `0.17.0` |
| **Datum** | 07-03-2026 15:32:07 |
| **Testplan** | TESTPLAN.md |
| **Resultaat** | **NIET GESLAAGD** |

---

## Samenvatting

| Suite | ✓ Geslaagd | ✗ Mislukt | △ Waarsch. | ○ Skip |
|---|---:|---:|---:|---:|
| Design (T) | 5 | 9 | 8 | 0 |
| Implementatie (GATE) | 8 | 13 | 9 | 0 |
| Performance (P) | 9 | 0 | 4 | 1 |
| Regressie (RC) | 0 | 0 | 0 | 8 |
| **Totaal** | **22** | **22** | **21** | **9** |

---

## Design (T)

### T1 — Tokens

- ✗ **T1.1 Ontbrekende tokens: --font-size-xs, --font-size-sm, --font-size-md…** — `22 ontbrekend`
- △ **T1.2 Verouderde tokens nog aanwezig** — `--surface2, --surface3, --border-hover, --input-border, --accent2, --accent3, --accent4, --shadow-1, --shadow-2`
- ✗ **T1.3 Verkeerde waarden: --font-size-xs=(verwacht 11px), --font-size-sm=(verwacht 12px), --font-size-md=(verwacht 14px), --space-1=(verwacht 4px), --space-2=(verwacht 8px), --radius-sm=(verwacht 4px), --radius-md=(verwacht 6px)**

### T2 — Typografie

- ✗ **T2.1a th font-size** — `14px (verwacht 11px)`
- ✗ **T2.1b th text-transform** — `none`
- ✓ **T2.2 .cell-primary 14px**
- △ **T2.3 Verboden font-sizes** — `16px×10, 13px×27, 9px×25, 22px×6`
- △ **T2.4 font-weight 700 op 17 btn/tab** — `btn btn-system`

### T3 — Kleur

- ✗ **T3.1 Hardcoded blauwe btn-hover (#DCF0F5) weg** — `nog aanwezig`
- ✗ **T3.2 Hardcoded cyaan row-hover (#EDF8FA) weg** — `nog aanwezig`
- ✗ **T3.3 Actieve tab achtergrond** — `rgb(237, 250, 245)`
- △ **T3.4 Groene agg-cel spans** — `19 gevonden`

### T4 — Borders

- ✗ **T4.1 td heeft border** — `L:0px R:0.8px`
- ✓ **T4.2 thead border-bottom ≤ 1px** — `0px`
- ✓ **T4.3 Border-radius ≥ 4px op interactieve elementen**
- ✓ **T4.4 Geen zichtbare .vsep dividers**

### T5 — Spacing

- ✗ **T5.1 Rijhoogte** — `34px (verwacht 32px), 13 rijen`
- △ **T5.2 Toolbar hoogte** — `50px (verwacht 36-44px)`
- ✓ **T5.3 Panel-header padding symmetrisch** — `L/R: 14px`
- △ **T5.4 Off-grid padding** — `85 waarden (drempel: <5)`

### T7 — Iconen

- △ **T7.1 Emoji in toolbar** — `⚡ 🎨 ❄ 🧪`
- △ **T7.2 Gekleurde avatars** — `24 van 36`

## Implementatie (GATE)

### GATE-1 — Token-definitie

- ✗ **Ontbrekende tokens** — `--font-size-xs, --space-1, --radius-sm, --color-accent-light, --shadow-sm, --duration-fast, --duration-normal, --border-strong`
- ✓ **Backward-compat aliassen aanwezig**
- ✓ **Stylesheet geladen**

### GATE-2 — Typografie

- ✓ **body font-size: 14px**
- ✗ **thead th font-size** — `14px`
- ✗ **thead th transform** — `none`
- △ **thead th font-weight** — `700`
- △ **.btn font-weight 700**
- △ **.label-caps nog niet toegepast in DOM**

### GATE-3 — Kleur

- ✗ **#DCF0F5 nog aanwezig**
- ✗ **#EDF8FA nog aanwezig**
- ✗ **#DAF2E8 nog aanwezig**
- ✗ **Tab.active achtergrond** — `rgb(237, 250, 245)`
- ✗ **--row-hover is nog cyaan** — `#EDF8FA`

### GATE-4 — Borders & lijnen

- ✗ **td verticale border** — `L:0px`
- ✓ **thead border-bottom ≤ 1px**
- ✓ **Border-radius ≥ 4px**
- ✓ **.vsep verborgen**

### GATE-5 — Spacing

- ✗ **Rijhoogte afwijkend** — `34px op 13 rijen`
- △ **Toolbar hoogte** — `50px`
- ✓ **Panel-header padding symmetrisch**
- △ **Off-grid padding** — `53 waarden`

### GATE-6 — Schaduwen & animaties

- △ **@keyframes slideOut nog aanwezig**
- △ **Zware schaduw-opaciteit** — `rgba(0,0,0,.12)`
- ✗ **--duration-fast ontbreekt**
- ✗ **--duration-normal ontbreekt**

### GATE-7 — Implementatie voltooid

- △ **Emoji in toolbar** — `⚡ 🎨 ❄ 🧪`
- △ **Aliassen nog aanwezig** — `--surface2, --surface3, --border-hover, --input-border, --accent2, --shadow-1, --shadow-2`
- ✗ **Regressie: th niet uppercase**
- ✓ **Regressie: geen td border-left**

## Performance (P)

### P1–P4 — CSS & Typografie metrics

- ✓ **P1 first-paint: 152ms** — `snel`
- ✓ **P1 first-contentful-paint: 152ms** — `snel`
- ✓ **P2a CSS regelcount** — `289 regels`
- ✓ **P2b CSS grootte** — `32.8 KB`
- △ **P3 Design tokens** — `88 (doel: ≤42)`
- △ **P4 Unieke font-sizes** — `9: 9px, 11px, 12px, 13px, 14px, 16px, 18px, 20px, 22px`

### P7–P9 — Runtime metrics

- ✓ **P7a Load tijd** — `127ms`
- ✓ **P7b DOM gereed** — `62ms`
- ✓ **P8 JS heap** — `9.5 MB`
- ✓ **P9a DOM nodes** — `1452 nodes`
- △ **P9b Off-grid padding** — `73 waarden (drempel: <5)`
- △ **P9c Hardcoded kleuren** — `#dcf0f5, #edf8fa, #daf2e8, #eff4f6`

### P5–P6 — Interactie-latency

- ✓ **P6 Hover reflow latency** — `1ms`
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

*Gegenereerd door Design Test Runner — Dashboard v0.17.0*