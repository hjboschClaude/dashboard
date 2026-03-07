# Design Plan — Clean Minimalist Redesign
## Dashboard Gemeente Rotterdam v0.14.0 → v0.15.0

**Datum:** 2026-03-07
**Aanpak:** Exhaustieve visuele audit → systematische minimalisering
**Principe:** Eliminate the unnecessary. Everything that remains must earn its place.

---

## Inhoudsopgave

1. [Diagnose — wat maakt het druk](#1-diagnose--wat-maakt-het-druk)
2. [Design Tokens — nieuw systeem](#2-design-tokens--nieuw-systeem)
3. [Typografie](#3-typografie)
4. [Kleurpalet](#4-kleurpalet)
5. [Spatiëring & maatvoering](#5-spatiëring--maatvoering)
6. [Borders & lijnen](#6-borders--lijnen)
7. [Schaduwen & elevatie](#7-schaduwen--elevatie)
8. [Icoontjes & decoratieve elementen](#8-icoontjes--decoratieve-elementen)
9. [Grid & layout](#9-grid--layout)
10. [Animaties](#10-animaties)
11. [Componentwijzigingen](#11-componentwijzigingen)
12. [Implementatievolgorde](#12-implementatievolgorde)

---

## 1. Diagnose — wat maakt het druk

De huidige visuele laag heeft **zeven bronnen van visuele ruis**:

### 1.1 Teveel kleuraccenten gelijktijdig actief

Het dashboard gebruikt 4 volledig onafhankelijke accentkleuren naast elkaar:
`#00811F` groen, `#D70D0D` rood, `#00689E` blauw, `#EB7900` oranje — plus
magenta (`#C93675`) voor CTA. Op elk moment zijn meerdere ervan zichtbaar in
toolbar-knoppen, tag-badges, conditionale rijen en actieve filters. Dit creëert
visuele concurrentie zonder hiërarchie.

**Doel:** Eén primaire kleur, één semantisch systeem (rood = fout, oranje = waarschuwing), de rest neutraal.

### 1.2 Inconsistent spacing (40+ unieke waarden)

De huidige spacing gebruikt 40+ unieke padding/margin/gap waarden:
`2px, 3px, 4px, 5px, 6px, 7px, 8px, 9px, 10px, 11px, 12px, 14px, 16px, 18px, 20px, 24px, 48px`.
Subpixelwaarden (`3px, 7px, 9px, 11px`) doorbreken elk ritme.

**Doel:** Één 4-punts grid. Alleen `4, 8, 12, 16, 20, 24, 32, 48px`.

### 1.3 12 verschillende font-sizes

De huidige font-size range: `9px, 10px, 11px, 12px, 13px, 14px, 16px, 20px, 22px, 36px`.
Elke extra font-size fragmenteert de typografische hiërarchie. De meeste zijn
in inline JS-gegenereerde HTML, buiten het CSS-systeem.

**Doel:** 4 font-sizes. `11px, 12px, 14px, 20px`. Drie hiërarchieniveaus + één display.

### 1.4 Font-weight alleen 400/700 — geen 500/600

De dashboardtekst springt van regulier (400) naar vet (700) zonder middentrap.
Knoppen, labels en namen zijn allemaal 700 — ongeacht hun visuele belang.
Dit geeft alles dezelfde nadruk.

**Doel:** Gebruik 400, 500, 600. Reserveer 700 voor één enkel element (paginatitel/logo).

### 1.5 8 border-radius waarden

`2px, 3px, 4px, 6px, 8px, 50%` — plus `border-radius: 0` op sommige elementen.
Subpixel-grenzen (`3px`) voelen willekeurig aan.

**Doel:** Twee waarden: `4px` (kleine elementen: chips, badges, knoppen) en `6px` (panels, modals, cards). Plus `50%` voor avatars.

### 1.6 Zware emoji-toolbar

De toolbar gebruikt 10 emoji's als knopiconen: `🔄 ⬇ ⚡ ☰ ↕ ⊞ 🎨 ❄ ↺ 🧪`.
Emoji renderen inconsistent per OS/browser (kleur, grootte, gewicht), breken het
monochrome palet, en voelen informeel aan in een gemeentelijke context.

**Doel:** Vervang door monoline unicode-symbolen of text-only labels. Eén consistent visueel gewicht.

### 1.7 Inline styles verspreid door JavaScript

Meer dan 40 locaties in de JavaScript-code genereren inline CSS. Dit bypast
het CSS-systeem en maakt design-tokens onbruikbaar. Kleuren, groottes en spacing
die in CSS-variabelen zijn gedefinieerd, worden in JS opnieuw hardcoded.

**Doel:** Extractie naar CSS-klassen (niet in dit plan geïmplementeerd — zie IMPLEMENTATIEPLAN.md Taak E.1).

---

## 2. Design Tokens — nieuw systeem

Vervang de bestaande `:root` variabelen door dit compacte, coherente systeem.

### 2.1 Volledige nieuwe `:root` definitie

```css
:root {
  /* ─── TYPOGRAFIE ──────────────────────────────────────────── */
  --font-family: 'DM Sans', system-ui, sans-serif;
  --font-size-xs:   11px;   /* labels, badges, hints */
  --font-size-sm:   12px;   /* secundaire tekst, tabelcellen */
  --font-size-md:   14px;   /* basistekst, knoppen, headers */
  --font-size-lg:   20px;   /* modal-titel, display */

  --font-weight-regular: 400;
  --font-weight-medium:  500;
  --font-weight-semibold: 600;

  --line-height-tight:  20px;  /* labels, badges, chips */
  --line-height-base:   24px;  /* basistekst */

  --letter-spacing-caps: 0.5px; /* alleen uppercase labels */

  /* ─── SPATIËRING (4-punts grid) ──────────────────────────── */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-12: 48px;

  /* ─── COMPONENT-DIMENSIES ───────────────────────────────── */
  --row-height:        32px;   /* was: 34px */
  --topbar-height:     48px;
  --tabbar-height:     36px;
  --toolbar-height:    40px;
  --btn-height:        32px;
  --input-height:      28px;
  --avatar-size:       22px;
  --checkbox-size:     16px;
  --col-checkbox-w:    40px;   /* was: 44px */

  /* ─── BORDER RADIUS ─────────────────────────────────────── */
  --radius-sm: 4px;   /* chips, badges, knoppen, inputs */
  --radius-md: 6px;   /* panels, modals, cards */
  --radius-full: 50%; /* avatars */

  /* ─── KLEUR: NEUTRALEN ──────────────────────────────────── */
  --color-white:   #FFFFFF;
  --color-gray-50: #F5F7F8;   /* achtergrond-niveau 0 */
  --color-gray-100: #EAEEF0;  /* achtergrond-niveau 1 */
  --color-gray-200: #D5DDE0;  /* borders (subtiel) */
  --color-gray-300: #B8C5C9;  /* borders (standaard) */
  --color-gray-500: #8A9BA1;  /* tekst (muted) */
  --color-gray-700: #4A5A60;  /* tekst (secundair) */
  --color-gray-900: #1A2B30;  /* tekst (primair) */

  /* ─── KLEUR: ACCENT (één primaire kleur) ──────────────── */
  --color-accent:       #00811F;  /* Rotterdam groen */
  --color-accent-light: #E8F5EC;  /* hover/selected bg */
  --color-accent-dark:  #006713;  /* pressed/deep */

  /* ─── KLEUR: SEMANTISCH ─────────────────────────────────── */
  --color-danger:       #C8000A;  /* iets donkerder dan huidige D70D0D */
  --color-danger-light: #FDEAEA;
  --color-warning:      #C46200;  /* iets donkerder dan EB7900 */
  --color-warning-light: #FEF3E2;
  --color-info:         #005E94;  /* iets donkerder dan 00689E */
  --color-info-light:   #E5F2F9;
  --color-success:      #00811F;  /* = accent */
  --color-success-light: #E8F5EC;

  /* ─── KLEUR: SEMANTISCHE ALIASSEN ───────────────────────── */
  --bg:          var(--color-white);
  --surface:     var(--color-gray-50);
  --surface-raised: var(--color-white);

  --border:      var(--color-gray-200);
  --border-strong: var(--color-gray-300);

  --text:        var(--color-gray-900);
  --text-secondary: var(--color-gray-700);
  --text-muted:  var(--color-gray-500);
  --text-on-accent: #FFFFFF;

  --accent:      var(--color-accent);
  --accent-bg:   var(--color-accent-light);

  --row-hover:   var(--color-gray-50);
  --row-selected: var(--color-accent-light);

  /* ─── SCHADUWEN (sterk gereduceerd) ────────────────────── */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);

  /* ─── FOCUS ─────────────────────────────────────────────── */
  --focus-ring: 0 0 0 2px var(--color-accent-light), 0 0 0 3px var(--color-accent);

  /* ─── OVERLAY ─────────────────────────────────────────────*/
  --overlay: rgba(0, 0, 0, 0.15);

  /* ─── SCROLLBAR ─────────────────────────────────────────── */
  --scrollbar-width: 4px;
}
```

### 2.2 Verwijder uit het token-systeem

De volgende bestaande variabelen zijn niet meer nodig en kunnen worden verwijderd:

```
/* Verwijderen: */
--surface2, --surface3           → gebruik --bg en --surface
--border-hover                   → gebruik --border-strong
--input-border                   → gebruik --border-strong
--accent2, --accent3, --accent4  → gebruik semantische aliassen
--cta, --cta-hover, --cta-bg     → niet gebruikt in dashboard-context
--header-bg, --toolbar-bg        → gebruik --surface
--color-ui-active                → gebruik --accent
--shadow-1, --shadow-2           → gebruik --shadow-sm en --shadow-md

/* Verwijderen: volledige kleurschalen */
--green-50 t/m --green-950       → vervangen door 3 accent tokens
--red-50 t/m --red-900           → vervangen door --color-danger + --color-danger-light
--blue-50 t/m --blue-900         → vervangen door --color-info + --color-info-light
--orange-50 t/m --orange-600     → vervangen door --color-warning + --color-warning-light
--yellow-50 t/m --yellow-600     → verwijderen (niet in minimaal design)
--magenta-400 t/m --magenta-600  → verwijderen (geen CTA in dit dashboard)
--gray-50 t/m --gray-950         → vervangen door 7 genummerde color-gray tokens
```

**Reductie:** Van 65+ variabelen naar 42 tokens.

---

## 3. Typografie

### 3.1 Type scale (voor → na)

| Gebruik | Huidig | Nieuw | Weight huidig | Weight nieuw |
|---|---|---|---|---|
| Label, badge, hint | 11px / 12px | `--font-size-xs` = 11px | 700 | **500** |
| Secundaire tekst, cel | 12px / 13px | `--font-size-sm` = 12px | 400 | **400** |
| Basistekst, knop, header | 14px | `--font-size-md` = 14px | 400 / 700 | **400 / 500** |
| Modal-titel, display | 20px | `--font-size-lg` = 20px | 700 | **600** |
| Logo / paginatitel | 14px / 16px | `--font-size-md` = 14px | 700 | **600** |

**Verwijder:** `9px, 10px, 16px, 22px, 36px` font-sizes volledig.

### 3.2 CSS-wijzigingen typografie

```css
/* ── BODY ─────────────────────────────────────────────────── */
body {
  font-family: var(--font-family);
  font-size: var(--font-size-md);         /* was: 14px (OK) */
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-base);
  color: var(--text);
}

/* ── TABELCELLEN ─────────────────────────────────────────── */
td {
  font-size: var(--font-size-sm);         /* was: 14px → naar 12px */
  font-weight: var(--font-weight-regular);
  color: var(--text-secondary);
}

.cell-primary {
  font-size: var(--font-size-md);         /* ongewijzigd */
  font-weight: var(--font-weight-medium); /* was: 700 → 500 */
  color: var(--text);
}

/* ── KOLOMHEADERS ────────────────────────────────────────── */
thead th {
  font-size: var(--font-size-xs);         /* was: 14px → 11px */
  font-weight: var(--font-weight-semibold); /* was: 700 → 600 */
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
  color: var(--text-muted);              /* was: --text → muted */
}

/* ── KNOPPEN ─────────────────────────────────────────────── */
.btn {
  font-size: var(--font-size-sm);         /* was: 14px → 12px */
  font-weight: var(--font-weight-medium); /* was: 700 → 500 */
}

/* ── TABS ────────────────────────────────────────────────── */
.tab {
  font-size: var(--font-size-sm);         /* was: 12px (OK) */
  font-weight: var(--font-weight-medium); /* was: 700 → 500 */
}

.tab.active {
  font-weight: var(--font-weight-semibold); /* actieve tab iets zwaarder */
}

/* ── LABELS (uppercase micro) ────────────────────────────── */
.label-caps {                              /* nieuw: uniforme label-klasse */
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
  color: var(--text-muted);
  line-height: var(--line-height-tight);
}

/* Gebruik .label-caps op: .af-label, .modal-label, panel sectiekoppen */
/* Verwijder: dubbele CSS in .af-label, .modal-label */

/* ── BADGES & CHIPS ──────────────────────────────────────── */
.tag {
  font-size: var(--font-size-xs);         /* was: 12px → 11px */
  font-weight: var(--font-weight-medium); /* was: 700 → 500 */
  letter-spacing: 0;                      /* was: .2px → verwijder */
}

/* ── MODAL ────────────────────────────────────────────────── */
.modal-title {
  font-size: var(--font-size-lg);         /* was: 20px (OK) */
  font-weight: var(--font-weight-semibold); /* was: 700 → 600 */
  line-height: var(--line-height-base);   /* was: 28px → 24px */
}

/* ── LOGO / PAGINATITEL ──────────────────────────────────── */
.logo {
  font-size: var(--font-size-md);         /* was: 16px → 14px */
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0;                      /* was: -0.3px → verwijder */
}

/* ── AGGREGATIERIJ ────────────────────────────────────────── */
.agg-cell {
  font-size: var(--font-size-xs);         /* was: 10px/11px → 11px */
  font-weight: var(--font-weight-regular);
  color: var(--text-muted);
}
```

### 3.3 Font-weight mapping (oud → nieuw)

| Element | Oud | Nieuw | Reden |
|---|---|---|---|
| Logo | 700 | 600 | Minder dominant |
| Kolomheaders | 700 | 600 | Nog steeds duidelijk, minder zwaar |
| `.cell-primary` | 700 | 500 | Primaire cel is content, niet heading |
| Knoppen | 700 | 500 | Knoppen zijn acties, niet display |
| Tabs actief | 700 | 600 | Onderscheiding behouden |
| Tags/badges | 700 | 500 | Zacht, informatief |
| Modal labels | 700 | 600 | Caps-labels mogen zwaarder |
| Panel titels | 700 | 600 | Structuur-element |
| Groepsrij | 700 | 600 | Hiërarchie-element |

---

## 4. Kleurpalet

### 4.1 Gebruik-kaart nieuw (vereenvoudigd)

```
NEUTRALEN (primaire taal van het ontwerp)
  --color-gray-900  Primaire tekst, naam in rijen
  --color-gray-700  Secundaire tekst, kolomwaarden
  --color-gray-500  Muted tekst, placeholders, muted labels
  --color-gray-300  Borders (standaard)
  --color-gray-200  Borders (subtiel: tabelcellen)
  --color-gray-100  Achtergrond toolbar, tabbar, panel-header
  --color-gray-50   Subtiele row-hover, lichte surfaces
  --color-white     Tabelachtergrond, modal, panel-body

ACCENT (één primaire kleur — Rotterdam groen)
  --color-accent       Primaire knop achtergrond, actieve tab-indicator,
                       checkbox (checked), actieve filter-badge
  --color-accent-dark  Knop hover/pressed state
  --color-accent-light Geselecteerde rij, hover-achtergrond acties,
                       tag-hover ring, lichte badges

SEMANTISCH (alleen voor status, nooit decoratief)
  --color-danger       Foutmelding tekst, verwijder-actie tekst
  --color-danger-light Achtergrond foutmeldingen, conditionale rode rij
  --color-warning      Waarschuwingstekst
  --color-warning-light Conditionale gele rij
  --color-info         Link-tekst, export-actie tekst
  --color-info-light   Achtergrond info-badge
```

### 4.2 Kleurwijzigingen per element (voor → na)

**Topbar & toolbar:**
```css
/* Was: --toolbar-bg: #EFF4F6 (licht blauw-grijs) */
/* Na:  onderscheid subtiel reduceren */
.topbar   { background: var(--bg); border-bottom: 1px solid var(--border); }
.tabbar   { background: var(--surface); border-bottom: 1px solid var(--border); }
.toolbar  { background: var(--bg); border-bottom: 1px solid var(--border); }
```

**Tabelrijen:**
```css
/* Was: --row-hover: #EDF8FA (cyan-blauw → sterk accent) */
/* Na: neutrale hover */
tbody tr:hover { background: var(--color-gray-50); }   /* was: #EDF8FA */

/* Was: --selected: #DAF2E8 (groen selected) */
/* Na: zachtere groene tint */
tbody tr.selected { background: var(--color-accent-light); } /* #E8F5EC */
```

**Knoppen:**
```css
/* Was: .btn:hover { background: #DCF0F5 } (hardcoded blauw) */
/* Na: neutrale hover */
.btn:hover { background: var(--color-gray-100); color: var(--text); }

/* Was: .btn.active { inset 0 0 0 1px var(--accent) + green-50 bg } */
/* Na: subtielere actieve staat */
.btn.active {
  background: var(--color-accent-light);
  color: var(--color-accent-dark);
  box-shadow: none;    /* verwijder inset ring */
}
```

**Tabs:**
```css
/* Was: .tab.active → --green-50 bg + --green-800 tekst */
/* Na: clean indicator zonder achtergrond */
.tab {
  color: var(--text-muted);
  border-bottom: 2px solid transparent;
}
.tab.active {
  color: var(--text);
  border-bottom: 2px solid var(--accent);
  background: transparent;   /* was: --green-50 */
}
.tab:hover:not(.active) {
  color: var(--text-secondary);
  background: transparent;   /* was: kleurachtergrond */
}
```

**Tags / status-badges:**
```css
/* Was: diverse accentkleuren per type */
/* Na: neutrale standaard, kleur alleen voor semantisch onderscheid */
.tag {
  background: var(--color-gray-100);
  color: var(--text-secondary);
  border: none;   /* was: border aanwezig */
}

/* Status-specifiek (alleen wanneer semantisch noodzakelijk): */
.tag[data-status="Actief"]    { background: var(--color-success-light); color: var(--color-success); }
.tag[data-status="On Hold"]   { background: var(--color-warning-light); color: var(--color-warning); }
.tag[data-status="Afgerond"]  { background: var(--color-gray-100); color: var(--text-muted); }

/* Prioriteit: visueel gewicht, niet kleur */
.tag[data-priority="Hoog"]   { font-weight: var(--font-weight-semibold); }
.tag[data-priority="Laag"]   { color: var(--text-muted); }
```

**Conditionale rijen:**
```css
/* Was: --cond-red td:first-child → 3px solid --accent2 */
/* Na: subtielere left-accent, zachtere achtergrond */
.cond-red    { background: var(--color-danger-light); }
.cond-yellow { background: var(--color-warning-light); }
.cond-green  { background: var(--color-success-light); }

/* Left-border blijft, maar 2px in plaats van 3px */
.cond-red td:first-child    { border-left: 2px solid var(--color-danger); }
.cond-yellow td:first-child { border-left: 2px solid var(--color-warning); }
.cond-green td:first-child  { border-left: 2px solid var(--color-accent); }
```

**Aggregatierij:**
```css
/* Was: --green-700 kleur op Σ-waarden */
/* Na: muted, niet groen */
.agg-cell span { color: var(--text-secondary); }   /* was: --green-700 */
```

**Focusring:**
```css
/* Was: 2px solid --accent (groen randje) */
/* Na: dubbele ring — transparant + accent (meer zichtbaar op elke achtergrond) */
:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
```

---

## 5. Spatiëring & maatvoering

### 5.1 Spacing-systeem cleanup

**Huidige waarden → standaard 4px-grid:**

| Huidig | Nieuw | Verschil |
|---|---|---|
| `2px, 3px` | `4px` (--space-1) | +1–2px |
| `5px, 6px` | `8px` (--space-2) | +2–3px |
| `7px, 9px` | `8px` (--space-2) | ±1px |
| `10px, 11px` | `12px` (--space-3) | +1–2px |
| `14px, 15px` | `16px` (--space-4) | +1–2px |
| `18px` | `16px` of `20px` | ±2px |
| `48px` | `48px` (--space-12) | ongewijzigd |

### 5.2 Component-maatvoering (voor → na)

**Rijhoogte:**
```css
/* Was: 34px (th-inner, tbody tr, add-row) */
/* Na: 32px — compacter, uniformer */
--row-height: 32px;

.th-inner   { height: var(--row-height); }
tbody tr    { height: var(--row-height); }
.add-row    { height: var(--row-height); }
```

**Topbar hoogte:** `48px → 48px` (ongewijzigd — goed)

**Tab bar:**
```css
/* Was: geen expliciete hoogte, .tab: padding: 4px 12px + borders */
/* Na: vaste hoogte van 36px */
.tabbar  { height: var(--tabbar-height); }   /* 36px */
.tab     { height: 100%; padding: 0 var(--space-3); }
```

**Toolbar:**
```css
/* Was: variabele hoogte, padding: 5px 6px */
/* Na: vaste hoogte van 40px, meer lucht */
.toolbar { height: var(--toolbar-height); padding: 0 var(--space-4); gap: var(--space-2); }
```

**Knoppen:**
```css
/* Was: .btn min-height: 36px, padding: 6px 12px */
/* Na: vaste hoogte 32px, kleinere padding */
.btn {
  height: var(--btn-height);   /* 32px */
  padding: 0 var(--space-3);   /* 0 12px */
  gap: var(--space-1);         /* 4px — was: 5px */
}
```

**Checkbox-kolom:**
```css
/* Was: td:first-child width/min-width/max-width: 44px */
/* Na: 40px — 4px smaller, compacter */
--col-checkbox-w: 40px;
td:first-child { width: var(--col-checkbox-w); }
```

**Panels:**
```css
/* Was: .panel-header: 12px 14px 10px (asymmetrisch) */
/* Na: uniform padding */
.panel-header { padding: var(--space-3) var(--space-4); }   /* 12px 16px */
.panel-body   { padding: var(--space-3) var(--space-4); }   /* 12px 16px */
.panel-footer { padding: var(--space-3) var(--space-4); }   /* 12px 16px */

/* Was: .panel min-width: 320px, max-width: 440px */
/* Na: iets smaller voor minder visueel gewicht */
.panel { min-width: 280px; max-width: 360px; }
```

**Modal:**
```css
/* Was: .modal padding: 24px, width: 420px */
/* Na: meer lucht, iets breder */
.modal { padding: var(--space-6); width: 440px; }   /* 24px, 440px */
```

**Tabelcellen:**
```css
/* Was: td padding niet expliciet gedefinieerd (inherited of inline) */
/* Na: uniforme cel-padding */
td, th {
  padding: 0 var(--space-3);   /* 0 12px — was: 0 11px (7px 11px) */
}
```

### 5.3 Whitespace-verhogingen (minimalism principles)

Meer lucht op de volgende plaatsen:

```css
/* 1. Tussen de topbar en tabbar: geen verandering nodig (borders scheiden al) */

/* 2. Boven de toolbar: border is de scheiding */

/* 3. Lege toestand (empty state) */
.empty-state { padding: var(--space-12) var(--space-6); gap: var(--space-4); }
/* Was: padding: 48px 24px — ongewijzigd */

/* 4. Filter-panel items — meer ademruimte */
.filter-rule { padding: var(--space-2) var(--space-3); }  /* was: 7px 9px */
.sort-rule   { padding: var(--space-2) var(--space-3); }
.group-item  { padding: var(--space-2) var(--space-3); }
```

---

## 6. Borders & lijnen

### 6.1 Border-radius consolidatie (6 → 3 waarden)

| Element | Huidig | Nieuw |
|---|---|---|
| Chips, badges, tags, `.af-chip` | `4px` | `var(--radius-sm)` = 4px |
| Knoppen `.btn`, `.btn-ghost` | `4px` | `var(--radius-sm)` = 4px |
| Inputs, selects | `4px` | `var(--radius-sm)` = 4px |
| Progress bar | `2px` | `var(--radius-sm)` = 4px (+2px, rounder) |
| `.col-filter-btn` | `3px` | `var(--radius-sm)` = 4px |
| `.col-drag` handle | `3px` | `var(--radius-sm)` = 4px |
| `.col-item.dragging` | `6px` | `var(--radius-md)` = 6px |
| Panels, modal, context-menu | `8px` | `var(--radius-md)` = 6px (-2px) |
| Toast | `8px` | `var(--radius-md)` = 6px |
| Avatar | `50%` | `var(--radius-full)` = 50% |

**Verwijder `3px` overal.** Minimaal `4px`.

### 6.2 Border-kleur vereenvoudiging

```css
/* Huidig: 3 border-variabelen (--border, --border-hover, --input-border) */
/* Nieuw: 2 border-variabelen */

--border:        var(--color-gray-200);  /* subtiel: tabelcellen, panels */
--border-strong: var(--color-gray-300);  /* standaard: inputs, focus-ring basis */

/* Toewijzing: */
table td, table th { border-color: var(--border); }
.panel            { border: 1px solid var(--border); }
input, select     { border: 1px solid var(--border-strong); }
input:focus       { border-color: var(--accent); }
```

### 6.3 Tabelgrid (kritieke vereenvoudiging)

**Huidig probleem:** De tabel heeft borders op elke cel (links, rechts, onder),
gecombineerd met achtergrondkleuren op hover/select, conditionale left-borders,
en een dikke `2px` bottom-border op de `thead`. Dit creëert een grid-patroon
dat de data visueel fragmenteert.

**Nieuw principe: horizontale lijnen alleen, geen verticale.**

```css
/* Verwijder: */
td { border-left: none; border-right: none; }    /* geen verticale celgrenzen */

/* Houd: */
td { border-bottom: 1px solid var(--border); }   /* alleen horizontale scheiding */

/* Header bottom */
thead { border-bottom: 1px solid var(--border-strong); }
/* Was: 2px — terug naar 1px */

/* Verwijder: kolomscheiders in header (.th-sep, .resize-handle visueel zichtbaar) */
/* Houd: resize-handle functioneel maar transparant tenzij hover */
.resize-handle {
  background: transparent;
  transition: background 0.15s;
}
.resize-handle:hover { background: var(--border-strong); }
```

### 6.4 Borders op actieve elementen

```css
/* Conditionale rij: 3px → 2px */
.cond-red td:first-child    { border-left: 2px solid var(--color-danger); }
.cond-yellow td:first-child { border-left: 2px solid var(--color-warning); }
.cond-green td:first-child  { border-left: 2px solid var(--color-accent); }

/* Actieve tab: alleen bottom-border, geen achtergrond */
.tab.active { border-bottom: 2px solid var(--accent); }

/* Panel niet meer: border-left only (inconsistent) */
/* Modal: standaard rand rondom */
.modal { border: 1px solid var(--border); border-left: 1px solid var(--border); }
```

### 6.5 Verwijder zichtbare dividers

```css
/* Verwijder: .vsep (1px verticale scheidingslijn in toolbar) */
/* Verwijder: .hsep (1px horizontale lijn in panels) */
/* Vervangen door: spacing (gap) als visuele scheiding */

/* Was: */
.vsep { width: 1px; background: var(--border); height: calc(100% - 16px); }

/* Na: verwijder .vsep elementen uit HTML of:  */
.vsep { display: none; }  /* totdat HTML opgeschoond is */
```

---

## 7. Schaduwen & elevatie

### 7.1 Schaduw-reductie (minder laag-gevoel)

```css
/* Was: --shadow-1 op subtiele elementen, --shadow-2 op panels/modals */
/* Na: één subtiele schaduw, borders doen het werk */

--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);   /* was: 2-layer shadow */
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);   /* was: 0 4px 16px .12 */

/* Toepassing: */
.panel    { box-shadow: var(--shadow-md); }
.ctx-menu { box-shadow: var(--shadow-md); }
.modal    { box-shadow: var(--shadow-md); }
.toast    { box-shadow: var(--shadow-sm); }

/* Verwijder: frozen column shadows (te subtiel om te rechtvaardigen) */
.frozen-col-header,
.frozen-col-body { box-shadow: none; }
/* Vervang door: border-right */
.frozen-col-header,
.frozen-col-body { border-right: 1px solid var(--border-strong); }
```

### 7.2 Inset shadows (actieve staat knoppen)

```css
/* Was: .btn.active → inset 0 0 0 1px var(--accent) + groen bg */
/* Na: achtergrond doet het werk, geen inset shadow */
.btn.active {
  background: var(--color-accent-light);
  color: var(--color-accent-dark);
  /* geen box-shadow */
}

/* Was: drag-indicator → inset 3px 0 0 0 --accent */
/* Houd: drag-indicator is functioneel, niet decoratief */
.th.th-drag-left  { box-shadow: inset 2px 0 0 0 var(--accent); }
.th.th-drag-right { box-shadow: inset -2px 0 0 0 var(--accent); }
```

---

## 8. Icoontjes & decoratieve elementen

### 8.1 Toolbar-emoji vervanging

**Huidig probleem:** 10 emoji-iconen renderen verschillend per OS/browser (kleur,
grootte, lijngewicht), zijn niet schaalbaar, en passen niet in een monochroom
ontwerp.

**Minimalistisch alternatief: text-only of unicode-symbolen met consistent gewicht**

| Knop | Huidig | Nieuw | Rationale |
|---|---|---|---|
| Reset view | `🔄` | `↺` | Monoline, geen kleur |
| Export | `⬇` | `↓` | Simpeler |
| Filter | `⚡` | text: `Filter` | Emoji heeft geen functionele waarde |
| Kolommen | `☰` | `☰` (ongewijzigd) | Al monoline |
| Sortering | `↕` | `↕` (ongewijzigd) | Al monoline |
| Groepering | `⊞` | text: `Groep` | Symbool onduidelijk |
| Opmaak | `🎨` | text: `Opmaak` | Emoji te zwaar |
| Bevriezing | `❄` | text: `Bevries` | Emoji te zwaar |
| Tests | `🧪` | (verborgen in productie) | — |

**CSS voor text-only knoppen:**
```css
/* Knoplabels zijn leesbaar op 12px/500 */
.btn {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  /* geen icon-padding nodig als geen icons */
}

/* Als icons gewenst blijven: gebruik CSS-symbolen */
.btn-export::before { content: '↓ '; }
.btn-filter::before { content: '⊟ '; }
.btn-cols::before   { content: '☰ '; }
```

### 8.2 Avatar-vereenvoudiging

```css
/* Was: gekleurd (6+ achtergrondkleuren per persoon) */
/* Na: monochroom — één neutrale kleur */
.avatar {
  width: var(--avatar-size);
  height: var(--avatar-size);
  border-radius: var(--radius-full);
  background: var(--color-gray-200);    /* was: dynamische kleur per naam */
  color: var(--color-gray-700);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}
```

> **Optie:** Houd gekleurde avatars als dit onderscheid functie heeft (personen
> herkennen). Maar gebruik dan CSS-klassen ipv inline `background`-styles.

### 8.3 Progress bar

```css
/* Was: groen fill (#00811F direct), 2px border-radius */
/* Na: grijs track, accent fill, 4px radius */
.progress-bar {
  background: var(--color-gray-100);
  border-radius: var(--radius-sm);
  height: 4px;                          /* was: ook 4px? controleren */
}
.progress-fill {
  background: var(--accent);
  border-radius: var(--radius-sm);
}
```

### 8.4 Checkbox-stijl

```css
/* Was: .check-box met border 1.5px, groen bg als checked */
/* Na: cleaner custom checkbox */
.check-box {
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  border: 1px solid var(--border-strong);  /* was: 1.5px */
  border-radius: var(--radius-sm);
  background: var(--bg);
}
.check-box.checked {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--text-on-accent);
}
.check-box.partial {
  background: var(--color-gray-100);
  border-color: var(--border-strong);
}
```

---

## 9. Grid & layout

### 9.1 Tabelkolom-breedtes

```css
/* Huidige defaults (hardcoded in JS): note/email → 180px, rest → 120px */
/* Na: iets ruimer voor leesbaarheid */
/* In JS-kolom-configuratie: */
var COL_WIDTH_DEFAULT = 128;   /* was: 120 */
var COL_WIDTH_WIDE    = 192;   /* was: 180 (note, email) */
var COL_WIDTH_NARROW  = 80;    /* nieuw: voor boolean, avatar kolommen */
```

### 9.2 Layout-vereenvoudiging

```css
/* ── TOPBAR ─────────────────────────────────────────────────── */
/* Was: topbar heeft veel padding en gap-variatie */
.topbar {
  display: flex;
  align-items: center;
  height: var(--topbar-height);     /* 48px */
  padding: 0 var(--space-4);        /* 0 16px */
  gap: var(--space-3);              /* 12px */
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}

/* ── TABBAR ──────────────────────────────────────────────────── */
.tabbar {
  display: flex;
  align-items: stretch;
  height: var(--tabbar-height);     /* 36px */
  padding: 0 var(--space-4);        /* 0 16px */
  gap: 0;                           /* tabs zijn adjacent */
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  scrollbar-width: none;
}

/* ── TOOLBAR ─────────────────────────────────────────────────── */
.toolbar {
  display: flex;
  align-items: center;
  height: var(--toolbar-height);    /* 40px */
  padding: 0 var(--space-4);        /* 0 16px */
  gap: var(--space-2);              /* 8px */
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  scrollbar-width: none;
}
```

### 9.3 Consistente zijde-padding

**Probleem:** De tabel heeft een andere linker-uitlijning dan de topbar/toolbar.
Bij kleine schermen is er geen consistente horizontale marge.

```css
/* Definieer één content-padding variabele */
--content-padding: var(--space-4);   /* 16px */

.topbar,
.tabbar,
.toolbar,
.table-wrap { padding-left: var(--content-padding); }
```

### 9.4 Scroll-area vereenvoudiging

```css
/* Scrollbar-stijl: mini en neutraal */
::-webkit-scrollbar        { width: var(--scrollbar-width); height: var(--scrollbar-width); }
::-webkit-scrollbar-track  { background: transparent; }
::-webkit-scrollbar-thumb  {
  background: var(--color-gray-300);
  border-radius: var(--radius-sm);
}
::-webkit-scrollbar-thumb:hover { background: var(--color-gray-500); }

/* Firefox */
* { scrollbar-width: thin; scrollbar-color: var(--color-gray-300) transparent; }
```

---

## 10. Animaties

### 10.1 Duur-standaardisering

**Huidig:** `0.08s, 0.1s, 0.12s, 0.15s, 0.2s` — 5 verschillende duraties.
**Nieuw:** 2 duraties.

```css
--duration-fast:    100ms;   /* state-changes: hover, active */
--duration-normal:  150ms;   /* UI-overgangen: panels, modals */
```

**Toepassing:**
```css
/* Row hover */
tbody tr    { transition: background var(--duration-fast); }

/* Buttons, tabs */
.btn, .tab  { transition: background var(--duration-fast), color var(--duration-fast); }

/* Panels, modals */
.panel      { animation: popIn var(--duration-normal) ease; }
.modal      { animation: slideIn var(--duration-normal) ease; }
.ctx-menu   { animation: popIn var(--duration-fast) ease; }
```

### 10.2 Animatie-vereenvoudiging

```css
/* Was: popIn gebruikt scale(.95) + translateY(-6px) */
/* Na: alleen opacity + translateY, geen scale (minder CLS-effect) */
@keyframes popIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Was: slideIn gebruikt translateX(100%) */
/* Na: subtielere slide + fade */
@keyframes slideIn {
  from { opacity: 0; transform: translateX(16px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Verwijder: slideOut (niet gebruikt) */
/* Houd: popOut (gebruikt in .modal.closing) */
@keyframes popOut {
  from { opacity: 1; }
  to   { opacity: 0; transform: translateY(-4px); }
}
```

---

## 11. Componentwijzigingen

### 11.1 Topbar — voor/na

```
VOOR:                               NA:
┌──────────────────────────────┐    ┌──────────────────────────────┐
│ 🏛 Dashboard Rotterdam   [x] │    │ Dashboard Rotterdam       [x] │
│                              │    │                              │
└──────────────────────────────┘    └──────────────────────────────┘
bg: #EFF4F6                         bg: white, border-bottom: 1px gray-200
logo: 16px/700                      logo: 14px/600, geen letter-spacing
```

### 11.2 Tab-bar — voor/na

```
VOOR:
┌─────────────────────────────────────────────────────┐
│[Projecten ×][Medewerkers ×][+ Nieuw]                │  bg: gray-50
└─────────────────────────────────────────────────────┘
Tab active: groen bg (#EDFAF5) + groen tekst (#004F0E)

NA:
┌─────────────────────────────────────────────────────┐
│ Projecten  Medewerkers  +                           │  bg: gray-50
│ ──────                                              │  border-bottom: 2px groen
└─────────────────────────────────────────────────────┘
Tab active: transparante bg + 2px border-bottom accentkleur
```

### 11.3 Toolbar — voor/na

```
VOOR:
[🔄][⬇ Exporteer][⚡ Filter 2][☰ Kolommen][↕ Sortering][⊞ Groep][🎨][❄][↺]

NA:
[↺][Exporteer][Filter 2][Kolommen][Sortering][Groep][Opmaak]
```
Knoppen: minder padding, 32px hoogte, 12px/500 tekst.

### 11.4 Tabelkolomheaders — voor/na

```
VOOR:
┌──────────────────────┬──────────────────────┐
│ Naam ▼              │ Status ▼             │
│ (14px/700, donker)   │                      │
├──────────────────────┼──────────────────────┤

NA:
┌──────────────────────┬──────────────────────┐
│ NAAM ↑              │ STATUS               │
│ (11px/600, muted,   │                      │
│  uppercase)          │                      │
├──────────────────────┴──────────────────────┤
```
Headers zijn geen content — ze zijn labels. Kleine uppercase labels zijn
minimaler en laten content de hoofdrol spelen.

### 11.5 Filterchips (active filters) — voor/na

```
VOOR:
[⚡ status: Actief ×][⚡ priority: Hoog ×]
bg: var(--green-50), tekst: green, border: green-200

NA:
[status: Actief ×][priority: Hoog ×]
bg: gray-100, tekst: gray-700, border: geen, 4px radius
```

### 11.6 Panel — voor/na

```
VOOR:                          NA:
┌────────────────────┐         ┌────────────────────┐
│Panel Titel      [×]│ ← bg    │Panel Titel      [×]│
├────────────────────┤         │                    │
│ Inhoud             │         │ Inhoud             │
│                    │         │                    │
├────────────────────┤         │                    │
│[Toepassen][Reset]  │         │[Toepassen]  [Reset]│
└────────────────────┘         └────────────────────┘
padding: 12px 14px 10px        padding: 12px 16px (uniform)
header-bg: gray-50             header-bg: white (geen kleurscheiding)
shadow: groot                  shadow: subtiel (--shadow-md)
```

---

## 12. Implementatievolgorde

De wijzigingen zijn geordend van **minste risico → meeste risico** qua regressie.

### Fase 1 — Token-definitie (30 min, nul visueel risico)

1. Vervang de `:root` blok volledig met het nieuwe token-systeem
2. Voeg `--duration-fast`, `--duration-normal` toe
3. Zorg dat alle verwijzingen naar verwijderde tokens werken via aliassen

```css
/* Tijdelijke aliassen zodat bestaande code niet breekt: */
--surface2: var(--bg);
--surface3: var(--color-gray-100);
--border-hover: var(--border-strong);
--input-border: var(--border-strong);
--accent2: var(--color-danger);
--accent3: var(--color-info);
--accent4: var(--color-warning);
--shadow-1: var(--shadow-sm);
--shadow-2: var(--shadow-md);
/* Verwijder aliassen stap voor stap nadat CSS is bijgewerkt */
```

### Fase 2 — Typografie (45 min)

1. Update `body` font-size, font-weight, line-height
2. Update `thead th` naar 11px/600/uppercase/muted
3. Update `.cell-primary` naar 14px/500
4. Update `td` naar 12px/400
5. Update `.btn`, `.tab` naar 12px/500
6. Voeg `.label-caps` klasse toe, pas toe op `.af-label`, `.modal-label`
7. Verwijder losse letter-spacing en line-height overrides

### Fase 3 — Kleur (60 min)

1. Update hover/selected kleuren op rijen
2. Update tab actief-staat (geen bg, alleen border-bottom)
3. Update knop hover-staat (grijs ipv blauw)
4. Update tags/badges naar neutrale standaard
5. Update aggregatierij tekst naar muted
6. Update avatar naar monochroom

### Fase 4 — Borders & lijnen (30 min)

1. Verwijder verticale celgrenzen in tabel
2. Reduceer thead border-bottom naar 1px
3. Verwijder of verberg `.vsep` elementen
4. Consolideer border-radius naar 3 waarden
5. Maak `.resize-handle` transparant tot hover

### Fase 5 — Spacing (45 min)

1. Update alle padding-waarden naar 4px-grid
2. Update rijhoogte naar 32px
3. Pas toolbar-hoogte aan naar 40px
4. Uniformeer panel-padding naar 12px 16px

### Fase 6 — Schaduwen & animaties (20 min)

1. Update shadow-variabelen
2. Verwijder frozen-column shadows → vervang door border
3. Update keyframes `popIn` en `slideIn`
4. Verwijder `slideOut` keyframe

### Fase 7 — Icoontjes (30 min)

1. Vervang emoji in toolbar door text of monoline unicode
2. Update avatar naar monochroom CSS
3. Teken progress bar opnieuw (4px hoogte, 4px radius)

### Totale schatting: ~4,5 uur puur CSS-werk.

---

## Bijlage — Snelle referentie

### Token-mapping (oud → nieuw)

| Oud token | Nieuw token |
|---|---|
| `--bg` | `--bg` (ongewijzigd, waarde: white) |
| `--surface` | `--surface` (waarde: gray-50) |
| `--surface2` | `--bg` |
| `--surface3` | `--color-gray-100` |
| `--border` | `--border` (waarde: gray-200) |
| `--border-hover` | `--border-strong` |
| `--input-border` | `--border-strong` |
| `--text` | `--text` (waarde: gray-900) |
| `--text-muted` | `--text-muted` (waarde: gray-500) |
| `--text-dim` | `--text-secondary` |
| `--text-body` | `--text` |
| `--accent` | `--accent` (ongewijzigd) |
| `--accent2` | `--color-danger` |
| `--accent3` | `--color-info` |
| `--accent4` | `--color-warning` |
| `--cta` | verwijderd |
| `--row-hover` | `--color-gray-50` |
| `--selected` | `--color-accent-light` |
| `--shadow-1` | `--shadow-sm` |
| `--shadow-2` | `--shadow-md` |
| `--header-bg` | `--surface` |
| `--toolbar-bg` | `--bg` |

### Verwachte score-verbetering (TOETSINGSKADER)

| Dimensie | Voor | Na | Delta |
|---|---|---|---|
| Consistentie (spacing) | 40+ unieke waarden | 8 waarden | −32 |
| Consistentie (font-sizes) | 10+ unieke waarden | 4 waarden | −6 |
| Consistentie (border-radius) | 6 waarden | 3 waarden | −3 |
| Hardcoded waarden (§12) | 15+ locaties | ≤ 5 | −10 |
| CSS-variabelen | 65+ tokens | 42 tokens | −23 |

---

*Gebaseerd op exhaustieve visuele audit van dashboard.html v0.14.0*
*Doel: clean minimalistic look — reduce, align, breathe.*
