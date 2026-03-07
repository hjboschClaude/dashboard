# Testplan — Design Wijzigingen
## Uitvoering via Chrome browser + DevTools (F12) op Windows

**Vereisten:**
- Chrome (willekeurige recente versie)
- `dashboard.html` lokaal opgeslagen (dubbelklik om te openen, of `File → Open`)
- F12 → Console-tab

---

## Inhoudsopgave

1. [Setup & orientatie](#1-setup--orientatie)
2. [Fase 1 — Tokens](#2-fase-1-tokens)
3. [Fase 2 — Typografie](#3-fase-2-typografie)
4. [Fase 3 — Kleur](#4-fase-3-kleur)
5. [Fase 4 — Borders & lijnen](#5-fase-4-borders--lijnen)
6. [Fase 5 — Spacing](#6-fase-5-spacing)
7. [Fase 7 — Iconen](#7-fase-7-iconen)
8. [Regressie — functionele checks](#8-regressie--functionele-checks)
9. [Consolescripts — snelle bulk-audit](#9-consolescripts--snelle-bulk-audit)
10. [Implementatieplan — fasegaten (go/no-go)](#10-implementatieplan--fasegaten-gono-go)
11. [Performance tests](#11-performance-tests)

---

## 1. Setup & orientatie

### 1.1 Bestand openen

1. Sla `dashboard.html` op in een map, bijv. `C:\test\dashboard.html`
2. Open Chrome
3. Sleep het bestand naar Chrome **of** druk `Ctrl+O` → navigeer naar het bestand
4. De URL in de adresbalk moet beginnen met `file:///`

> **Let op:** Google Fonts laadt alleen bij internetverbinding. Zonder internet
> valt het font terug op `system-ui` (Segoe UI op Windows). Visueel bijna
> identiek, maar lettergewichten kunnen iets afwijken.

### 1.2 DevTools inrichten

```
F12 → ga naar de "Console" tab
Zorg dat je de volgende tabs kent:
  Elements   → bekijk HTML-structuur en toegepaste CSS
  Console    → voer testscripts uit
  Computed   → zie definitieve CSS-waarden per element (in Elements → rechterpaneel)
```

### 1.3 Handige DevTools shortcuts

| Actie | Shortcut |
|---|---|
| Element inspecteren | `Ctrl+Shift+C` → klik op element |
| Computed CSS zien | Elements panel → rechts: "Computed" tab |
| CSS-variabele opzoeken | Elements → `<html>` selecteren → "Computed" → zoek op naam |
| Console leegmaken | `Ctrl+L` |
| Vorige consoleopdracht | Pijl omhoog ↑ |

---

## 2. Fase 1 — Tokens

**Doel:** Controleer dat alle nieuwe CSS-tokens correct zijn gedefinieerd op `:root`.

### Test T1.1 — Alle nieuwe tokens aanwezig

Plak dit script in de Console en druk `Enter`:

```javascript
// T1.1 — Controleer aanwezigheid nieuwe design tokens
const root = getComputedStyle(document.documentElement);
const required = [
  '--font-size-xs','--font-size-sm','--font-size-md','--font-size-lg',
  '--font-weight-regular','--font-weight-medium','--font-weight-semibold',
  '--line-height-tight','--line-height-base',
  '--space-1','--space-2','--space-3','--space-4','--space-6','--space-8','--space-12',
  '--row-height','--topbar-height','--tabbar-height','--toolbar-height',
  '--btn-height','--input-height','--radius-sm','--radius-md',
  '--color-white','--color-gray-50','--color-gray-100','--color-gray-200',
  '--color-gray-300','--color-gray-500','--color-gray-700','--color-gray-900',
  '--color-accent','--color-accent-light','--color-accent-dark',
  '--color-danger','--color-danger-light','--color-warning','--color-warning-light',
  '--color-info','--color-info-light',
  '--border','--border-strong','--text','--text-secondary','--text-muted',
  '--shadow-sm','--shadow-md','--focus-ring','--overlay','--duration-fast','--duration-normal'
];
const missing = required.filter(t => !root.getPropertyValue(t).trim());
if (missing.length === 0) {
  console.log('%c✓ T1.1 GESLAAGD — alle ' + required.length + ' tokens aanwezig', 'color:green;font-weight:bold');
} else {
  console.error('✗ T1.1 MISLUKT — ontbrekende tokens:');
  missing.forEach(t => console.error('  ' + t));
}
```

**Verwacht resultaat:** `✓ T1.1 GESLAAGD — alle 51 tokens aanwezig`

---

### Test T1.2 — Verwijderde tokens zijn weg

```javascript
// T1.2 — Controleer dat verouderde tokens zijn verwijderd
const root = getComputedStyle(document.documentElement);
const removed = [
  '--surface2','--surface3','--border-hover','--input-border',
  '--accent2','--accent3','--accent4','--cta','--cta-hover','--cta-bg',
  '--header-bg','--toolbar-bg','--color-ui-active','--shadow-1','--shadow-2'
];
const stillPresent = removed.filter(t => root.getPropertyValue(t).trim());
if (stillPresent.length === 0) {
  console.log('%c✓ T1.2 GESLAAGD — geen verouderde tokens meer', 'color:green;font-weight:bold');
} else {
  console.warn('△ T1.2 LET OP — deze tokens zijn nog aanwezig (aliassen of nog in gebruik?):');
  stillPresent.forEach(t => console.warn('  ' + t + ' = ' + root.getPropertyValue(t).trim()));
}
```

**Verwacht resultaat:** groen (of waarschuwingen bij tijdelijke aliassen — acceptabel in Fase 1)

---

### Test T1.3 — Token waarden kloppen

```javascript
// T1.3 — Controleer exacte waarden van kritieke tokens
const r = getComputedStyle(document.documentElement);
const checks = [
  ['--font-size-xs',   '11px'],
  ['--font-size-sm',   '12px'],
  ['--font-size-md',   '14px'],
  ['--space-1',        '4px'],
  ['--space-2',        '8px'],
  ['--space-4',        '16px'],
  ['--row-height',     '32px'],
  ['--btn-height',     '32px'],
  ['--radius-sm',      '4px'],
  ['--radius-md',      '6px'],
  ['--color-accent',   '#00811f'],
];
let ok = 0, fail = 0;
checks.forEach(([token, expected]) => {
  const actual = r.getPropertyValue(token).trim().toLowerCase();
  if (actual === expected) {
    ok++;
  } else {
    fail++;
    console.error(`✗ ${token}: verwacht "${expected}", gevonden "${actual}"`);
  }
});
if (fail === 0) {
  console.log(`%c✓ T1.3 GESLAAGD — alle ${ok} waarden correct`, 'color:green;font-weight:bold');
} else {
  console.warn(`△ T1.3 DEELS — ${ok} ok, ${fail} fout`);
}
```

---

## 3. Fase 2 — Typografie

### Test T2.1 — Kolomheaders zijn uppercase en 11px

```javascript
// T2.1 — Tabelheaders: 11px, uppercase, muted kleur
const th = document.querySelector('thead th .th-inner') || document.querySelector('thead th');
if (!th) { console.error('✗ Geen <thead th> gevonden'); } else {
  const s = getComputedStyle(th);
  const checks = [
    ['font-size',       '11px',     s.fontSize],
    ['text-transform',  'uppercase', s.textTransform],
    ['font-weight',     '600',      s.fontWeight],
  ];
  checks.forEach(([prop, exp, actual]) => {
    if (actual === exp) console.log(`%c✓ th ${prop}: ${actual}`, 'color:green');
    else console.error(`✗ th ${prop}: verwacht ${exp}, gevonden ${actual}`);
  });
}
```

**Visuele check:**
- Open dashboard → kolomheaders zien er kleiner uit dan rij-inhoud
- Letters zijn in hoofdletters (NAAM, STATUS, etc.)
- Kleur is grijs/muted, niet zwart

---

### Test T2.2 — Primaire celinhoud is 14px/500

```javascript
// T2.2 — .cell-primary: 14px, font-weight 500
const cell = document.querySelector('.cell-primary');
if (!cell) { console.error('✗ Geen .cell-primary gevonden'); } else {
  const s = getComputedStyle(cell);
  ['fontSize:14px', 'fontWeight:500'].forEach(c => {
    const [prop, exp] = c.split(':');
    const actual = s[prop];
    if (actual === exp) console.log(`%c✓ .cell-primary ${prop}: ${actual}`, 'color:green');
    else console.error(`✗ .cell-primary ${prop}: verwacht ${exp}, gevonden ${actual}`);
  });
}
```

---

### Test T2.3 — Geen verboden font-sizes

```javascript
// T2.3 — Scan ALLE elementen op verboden font-sizes
const forbidden = ['9px','10px','13px','16px','22px','36px'];
const all = document.querySelectorAll('*');
const found = {};
all.forEach(el => {
  const fs = getComputedStyle(el).fontSize;
  if (forbidden.includes(fs)) {
    found[fs] = found[fs] || [];
    found[fs].push(el.tagName + (el.className ? '.' + [...el.classList].join('.') : ''));
  }
});
if (Object.keys(found).length === 0) {
  console.log('%c✓ T2.3 GESLAAGD — geen verboden font-sizes gevonden', 'color:green;font-weight:bold');
} else {
  console.warn('△ T2.3 — verboden font-sizes aangetroffen:');
  Object.entries(found).forEach(([size, els]) => {
    console.warn(`  ${size}: ${[...new Set(els)].slice(0,5).join(', ')}`);
  });
}
```

**Acceptabel:** 0 resultaten. Max 3 uitzonderingen als ze verborgen/overlay-elementen zijn.

---

### Test T2.4 — Font-weight 700 nergens meer op knoppen/tabs

```javascript
// T2.4 — Geen font-weight 700 op .btn of .tab
const targets = [...document.querySelectorAll('.btn, .tab')];
const heavy = targets.filter(el => getComputedStyle(el).fontWeight === '700');
if (heavy.length === 0) {
  console.log('%c✓ T2.4 GESLAAGD — geen font-weight 700 op btn/tab', 'color:green;font-weight:bold');
} else {
  console.warn(`△ T2.4 — ${heavy.length} elementen nog op 700:`);
  heavy.slice(0,5).forEach(el => console.warn(' ', el.outerHTML.substring(0,80)));
}
```

---

### Visuele checks typografie

Open dashboard, bekijk:

| Check | Verwacht na wijziging |
|---|---|
| Kolomheaders | Klein (11px), grijs, hoofdletters |
| Naam in rij | Groter (14px), middel gewicht (niet vet) |
| Overige cellen | Iets kleiner (12px), lichtgrijs |
| Knoptekst | 12px, niet vet |
| Actieve tab | Iets zwaarder dan inactieve tab |
| Modal-titel | Duidelijk groter (20px), niet maximaal vet |

---

## 4. Fase 3 — Kleur

### Test T3.1 — Rij-hover is grijs (niet cyaan)

```javascript
// T3.1 — Row hover achtergrond is --color-gray-50
// Stap 1: lees de variabele op
const expected = getComputedStyle(document.documentElement)
  .getPropertyValue('--row-hover').trim() ||
  getComputedStyle(document.documentElement)
  .getPropertyValue('--color-gray-50').trim();
console.log('Row hover kleur zou moeten zijn:', expected);
console.log('(Controleer ook visueel: hover over een rij — is het neutraal grijs of cyaan-blauw?)');
```

**Visuele check:**
1. Beweeg muis over een tabelrij
2. De achtergrond moet subtiel **lichtgrijs** worden (niet blauw/cyaan `#EDF8FA`)

---

### Test T3.2 — Knop hover is grijs (niet blauw)

```javascript
// T3.2 — Haal de hover-kleur op via CSSRules
const styleSheets = [...document.styleSheets];
let btnHoverBg = null;
styleSheets.forEach(sheet => {
  try {
    [...sheet.cssRules].forEach(rule => {
      if (rule.selectorText && rule.selectorText.includes('.btn:hover')) {
        btnHoverBg = rule.style.background || rule.style.backgroundColor;
      }
    });
  } catch(e) {}
});
if (btnHoverBg) {
  const isBlue = btnHoverBg.toLowerCase().includes('dcf0f5') || btnHoverBg.toLowerCase().includes('blue');
  if (isBlue) console.error('✗ T3.2 MISLUKT — knop hover is nog steeds blauw: ' + btnHoverBg);
  else console.log('%c✓ T3.2 — knop hover kleur: ' + btnHoverBg, 'color:green;font-weight:bold');
} else {
  console.warn('△ T3.2 — .btn:hover background niet gevonden in CSS (controleer visueel)');
}
```

**Visuele check:**
1. Hover over een toolbar-knop
2. Achtergrond moet **lichtgrijs** worden (was: lichtblauw `#DCF0F5`)

---

### Test T3.3 — Actieve tab zonder gekleurde achtergrond

```javascript
// T3.3 — Actieve tab heeft transparante achtergrond
const activeTab = document.querySelector('.tab.active');
if (!activeTab) { console.warn('△ T3.3 — geen .tab.active gevonden'); } else {
  const bg = getComputedStyle(activeTab).backgroundColor;
  const isTransparent = bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent';
  if (isTransparent) {
    console.log('%c✓ T3.3 GESLAAGD — actieve tab heeft transparante achtergrond', 'color:green;font-weight:bold');
  } else {
    console.error('✗ T3.3 MISLUKT — actieve tab achtergrond: ' + bg);
    console.log('  (Verwacht: transparant + 2px border-bottom in accentkleur)');
  }
}
```

---

### Test T3.4 — Aggregatierij niet groen

```javascript
// T3.4 — .agg-cell spans zijn niet meer groen
const aggSpans = document.querySelectorAll('.agg-cell span');
if (!aggSpans.length) { console.warn('△ T3.4 — geen .agg-cell spans gevonden'); } else {
  const green = [...aggSpans].filter(el => {
    const c = getComputedStyle(el).color;
    return c.includes('0, 129') || c.includes('0, 97') || c.includes('006113');
  });
  if (green.length === 0) {
    console.log('%c✓ T3.4 GESLAAGD — aggregatiewaarden zijn niet groen', 'color:green;font-weight:bold');
  } else {
    console.error(`✗ T3.4 MISLUKT — ${green.length} groene agg-cel spans gevonden`);
  }
}
```

---

### Test T3.5 — Hardcoded kleuren weg uit CSS

```javascript
// T3.5 — Zoek naar hardcoded kleuren in de stylesheet
const banned = ['#DCF0F5','#EDF8FA','#DAF2E8','#EFF4F6'];
const css = [...document.styleSheets].map(s => {
  try { return [...s.cssRules].map(r => r.cssText).join(' '); }
  catch(e) { return ''; }
}).join(' ');

const found2 = banned.filter(c => css.toLowerCase().includes(c.toLowerCase()));
if (found2.length === 0) {
  console.log('%c✓ T3.5 GESLAAGD — geen hardcoded accentkleuren in CSS', 'color:green;font-weight:bold');
} else {
  console.error('✗ T3.5 MISLUKT — hardcoded kleuren gevonden:');
  found2.forEach(c => console.error('  ' + c));
}
```

---

## 5. Fase 4 — Borders & lijnen

### Test T4.1 — Rijhoogte is 32px

```javascript
// T4.1 — tbody rijen zijn 32px hoog
const rows = document.querySelectorAll('tbody tr');
if (!rows.length) { console.warn('△ T4.1 — geen tbody tr gevonden'); } else {
  const wrong = [...rows].filter(r => r.offsetHeight !== 32);
  if (wrong.length === 0) {
    console.log(`%c✓ T4.1 GESLAAGD — alle ${rows.length} rijen zijn 32px hoog`, 'color:green;font-weight:bold');
  } else {
    console.error(`✗ T4.1 MISLUKT — ${wrong.length} rijen hebben niet 32px hoogte:`);
    console.log('  Eerste afwijking:', wrong[0].offsetHeight + 'px');
  }
}
```

---

### Test T4.2 — Geen verticale celgrenzen

```javascript
// T4.2 — td heeft geen linker/rechter border
const td = document.querySelector('tbody td');
if (!td) { console.warn('△ T4.2 — geen tbody td gevonden'); } else {
  const s = getComputedStyle(td);
  const leftW  = s.borderLeftWidth;
  const rightW = s.borderRightWidth;
  if (leftW === '0px' && rightW === '0px') {
    console.log('%c✓ T4.2 GESLAAGD — geen verticale celgrenzen', 'color:green;font-weight:bold');
  } else {
    console.error(`✗ T4.2 MISLUKT — border-left: ${leftW}, border-right: ${rightW}`);
    console.log('  (Verwacht: beide 0px — alleen border-bottom behouden)');
  }
}
```

---

### Test T4.3 — Border-radius consistentie (alleen 4px, 6px, 50%)

```javascript
// T4.3 — Scan op border-radius waarden buiten het toegestane systeem
const allowed = ['0px','4px','6px','50%','11px','22px']; // 11px/22px = 50% van 22px/44px
const all3 = document.querySelectorAll('button, input, select, .btn, .tab, .panel, .modal, .tag, .af-chip, .toast');
const violations = {};
all3.forEach(el => {
  const br = getComputedStyle(el).borderRadius;
  if (!allowed.includes(br) && br !== '' && br !== '0px 0px 0px 0px') {
    violations[br] = violations[br] || [];
    violations[br].push(el.className || el.tagName);
  }
});
if (Object.keys(violations).length === 0) {
  console.log('%c✓ T4.3 GESLAAGD — border-radius consistent', 'color:green;font-weight:bold');
} else {
  console.warn('△ T4.3 — afwijkende border-radius waarden:');
  Object.entries(violations).forEach(([r, els]) => {
    console.warn(`  ${r}: ${[...new Set(els)].slice(0,3).join(', ')}`);
  });
}
```

---

### Test T4.4 — thead border-bottom is 1px (was 2px)

```javascript
// T4.4 — Tabelheader ondergrens is 1px
const thead = document.querySelector('thead');
if (!thead) { console.warn('△ T4.4 — geen thead gevonden'); } else {
  const bw = getComputedStyle(thead).borderBottomWidth;
  if (bw === '1px') {
    console.log('%c✓ T4.4 GESLAAGD — thead border-bottom: 1px', 'color:green;font-weight:bold');
  } else {
    console.error(`✗ T4.4 MISLUKT — thead border-bottom: ${bw} (verwacht 1px)`);
  }
}
```

---

### Visuele checks borders

| Check | Verwacht |
|---|---|
| Tabel-grid | Alleen horizontale lijnen, geen verticale rasterlijnen |
| Kolomscheiders in header | Onzichtbaar (transparant) tenzij je over de rand hovert |
| Panel | Subtiele rand, geen zware schaduw |
| Knoppen | 4px afgerond, geen inset-schaduw bij actief |
| Conditionale rode rij | Dunne 2px linkse rode streep |

---

## 6. Fase 5 — Spacing

### Test T5.1 — Spacing op 4px-grid

```javascript
// T5.1 — Controleer padding van topbar, toolbar, knoppen
function checkSpacing(selector, expected) {
  const el = document.querySelector(selector);
  if (!el) { console.warn(`△ ${selector} niet gevonden`); return; }
  const s = getComputedStyle(el);
  const actual = `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`;
  // Controleer of alle padding-waarden deelbaar zijn door 4
  const values = [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft];
  const offGrid = values.filter(v => parseFloat(v) % 4 !== 0);
  if (offGrid.length === 0) {
    console.log(`%c✓ ${selector} padding op grid: ${actual}`, 'color:green');
  } else {
    console.error(`✗ ${selector} padding NIET op grid: ${actual}`);
    console.error(`  Off-grid waarden: ${offGrid.join(', ')}`);
  }
}

checkSpacing('.topbar', '0 16px 0 16px');
checkSpacing('.toolbar', '0 16px 0 16px');
checkSpacing('.btn', '0 12px 0 12px');
```

---

### Test T5.2 — Checkbox-kolom is 40px (was 44px)

```javascript
// T5.2 — Eerste kolom (checkbox) is 40px breed
const firstTh = document.querySelector('thead th:first-child');
const firstTd = document.querySelector('tbody td:first-child');
[['thead th:first-child', firstTh], ['tbody td:first-child', firstTd]].forEach(([sel, el]) => {
  if (!el) { console.warn(`△ ${sel} niet gevonden`); return; }
  const w = el.offsetWidth;
  if (w <= 44 && w >= 36) {
    console.log(`%c✓ ${sel} breedte: ${w}px (acceptabel)`, 'color:green');
  } else {
    console.error(`✗ ${sel} breedte: ${w}px (verwacht ~40px)`);
  }
});
```

---

### Test T5.3 — Panel padding uniform

```javascript
// T5.3 — Panel header/body/footer hebben gelijke horizontale padding
const panelHeader = document.querySelector('.panel-header');
const panelBody   = document.querySelector('.panel-body');
const panelFooter = document.querySelector('.panel-footer');
[panelHeader, panelBody, panelFooter].forEach((el, i) => {
  if (!el) return;
  const names = ['panel-header','panel-body','panel-footer'];
  const s = getComputedStyle(el);
  const hr = s.paddingLeft === s.paddingRight ? '✓' : '✗';
  console.log(`${hr} .${names[i]} padding: L=${s.paddingLeft} R=${s.paddingRight} T=${s.paddingTop} B=${s.paddingBottom}`);
});
```

---

## 7. Fase 7 — Iconen

### Test T7.1 — Geen gekleurde emoji in toolbar

```javascript
// T7.1 — Zoek op bekende emoji in toolbar
const toolbar = document.querySelector('.toolbar');
if (!toolbar) { console.warn('△ Geen .toolbar gevonden'); } else {
  const text = toolbar.innerText;
  const emoji = ['🔄','⬇','⚡','🎨','❄','🧪','📄','📊'];
  const found = emoji.filter(e => text.includes(e));
  if (found.length === 0) {
    console.log('%c✓ T7.1 GESLAAGD — geen gekleurde emoji in toolbar', 'color:green;font-weight:bold');
  } else {
    console.error(`✗ T7.1 MISLUKT — emoji nog aanwezig: ${found.join(' ')}`);
  }
}
```

---

### Test T7.2 — Avatar is monochroom

```javascript
// T7.2 — Avatars gebruiken geen bonte achtergrondkleuren
const avatars = document.querySelectorAll('.avatar');
if (!avatars.length) { console.warn('△ Geen .avatar gevonden'); } else {
  const expectedBg = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-gray-200').trim();
  avatars.forEach((av, i) => {
    const bg = av.style.background || av.style.backgroundColor || getComputedStyle(av).backgroundColor;
    const isGray = bg.includes('gray') || bg === expectedBg || bg.toLowerCase().includes('d5dde0');
    if (!isGray) {
      console.warn(`△ Avatar ${i+1} heeft kleur: ${bg} (verwacht grijs)`);
    }
  });
  console.log(`Gecontroleerd: ${avatars.length} avatars`);
}
```

---

## 8. Regressie — functionele checks

Na elke fase: controleer dat het dashboard nog werkt.

### RC1 — Tabs werken

```
1. Klik op een andere tab naast de actieve
2. Verwacht: tabinhoud wisselt, actieve tab-indicator verplaatst zich
3. Fout als: niets gebeurt of de pagina refresht
```

### RC2 — Filters openen

```
1. Klik op "Filter" knop in de toolbar
2. Verwacht: filterpanel schuift open rechts
3. Voeg een filterregel toe (bijv. Status = Actief)
4. Klik Toepassen
5. Verwacht: tabel filtert zichtbare rijen
```

### RC3 — Kolomsortering

```
1. Klik op een kolomheader
2. Verwacht: sorteerindicator (↑ of ↓) verschijnt, rijen herschikken
3. Klik nogmaals: richting wisselt
```

### RC4 — Rijselectie (checkbox)

```
1. Klik op de checkbox in de eerste kolom van een rij
2. Verwacht: rij krijgt groene/gemarkeerde achtergrond
3. Klik op de select-all checkbox (eerste kolomheader)
4. Verwacht: alle rijen geselecteerd
```

### RC5 — Context-menu

```
1. Rechtsklik op een tabelrij
2. Verwacht: contextmenu verschijnt met opties
3. Klik buiten het menu: het sluit
```

### RC6 — Kolom resize

```
1. Beweeg muis naar de rechterrand van een kolomheader
   (cursor verandert naar col-resize ↔)
2. Sleep om breedte aan te passen
3. Verwacht: kolom past breedte aan
```

### RC7 — Panel animaties

```
1. Open filterpanel → sluit het
2. Open kolomoverzicht → sluit het
3. Verwacht: elk panel opent/sluit met een subtiele fade-in/fade-out
4. Fout als: harde sprong zonder animatie, of console-errors
```

### RC8 — Console errors

Na elke fase:

```javascript
// Plak dit in console na elke fase
// Chrome toont errors al rood in de console, maar dit bevestigt:
console.log('Console fouten:', window.__errors || 'Handmatig controleren — kijk naar rode regels boven');
```

**Controleer zelf:** zijn er rode foutmeldingen in de Console-tab?
Acceptabel: waarschuwingen (geel). Niet acceptabel: fouten (rood).

---

## 9. Consolescripts — snelle bulk-audit

### Volledig token-rapport uitprinten

```javascript
// Print alle CSS custom properties van :root naar console
const style = getComputedStyle(document.documentElement);
const all = [...document.styleSheets].flatMap(s => {
  try {
    return [...s.cssRules].filter(r => r.selectorText === ':root')
      .flatMap(r => [...r.style]);
  } catch(e) { return []; }
});
console.group('CSS Custom Properties (:root)');
all.sort().forEach(prop => {
  console.log(`${prop.padEnd(30)} = ${style.getPropertyValue(prop).trim()}`);
});
console.groupEnd();
```

---

### Alle font-sizes in gebruik

```javascript
// Overzicht van alle font-sizes op zichtbare elementen
const sizes = {};
document.querySelectorAll('*').forEach(el => {
  if (el.offsetParent === null && el !== document.body) return; // skip hidden
  const fs = getComputedStyle(el).fontSize;
  sizes[fs] = (sizes[fs] || 0) + 1;
});
console.table(Object.entries(sizes).sort((a,b) => parseFloat(a[0])-parseFloat(b[0]))
  .map(([size, count]) => ({size, count})));
```

---

### Alle border-radius waarden in gebruik

```javascript
// Overzicht van alle border-radius op interactieve elementen
const radii = {};
document.querySelectorAll('button,input,select,.btn,.tab,.tag,.panel,.modal,.af-chip,.toast,.avatar').forEach(el => {
  const br = getComputedStyle(el).borderRadius;
  if (br && br !== '0px') {
    radii[br] = (radii[br] || 0) + 1;
  }
});
console.table(Object.entries(radii).sort().map(([radius, count]) => ({radius, count})));
```

---

### Alle box-shadow waarden

```javascript
// Overzicht van alle box-shadows in gebruik
const shadows = {};
document.querySelectorAll('*').forEach(el => {
  const bs = getComputedStyle(el).boxShadow;
  if (bs && bs !== 'none') {
    const key = bs.length > 60 ? bs.substring(0,60)+'...' : bs;
    shadows[key] = (shadows[key] || 0) + 1;
  }
});
console.table(Object.entries(shadows).map(([shadow, count]) => ({shadow, count})));
```

---

### Pixel-perfecte spacing-audit

```javascript
// Vind alle padding-waarden die NIET op het 4px-grid staan
const offGrid = [];
document.querySelectorAll('*').forEach(el => {
  const s = getComputedStyle(el);
  ['paddingTop','paddingRight','paddingBottom','paddingLeft'].forEach(prop => {
    const val = parseFloat(s[prop]);
    if (val > 0 && val % 4 !== 0) {
      offGrid.push({
        element: el.tagName + (el.className ? '.' + [...el.classList].join('.').substring(0,30) : ''),
        property: prop,
        value: s[prop]
      });
    }
  });
});
if (offGrid.length === 0) {
  console.log('%c✓ Alle padding op 4px-grid', 'color:green;font-weight:bold');
} else {
  console.warn(`${offGrid.length} off-grid padding waarden gevonden:`);
  console.table(offGrid.slice(0,20));
}
```

---

## 10. Implementatieplan — fasegaten (go/no-go)

Per fase uit DESIGN_PLAN.md §12 een go/no-go check.
Voer de check uit **nadat** je een fase hebt afgerond, vóór de volgende fase begint.

### Fase 1 voltooid? — Token-definitie

```javascript
// GATE-1 — Mag ik naar Fase 2?
(function gate1() {
  const r = getComputedStyle(document.documentElement);

  // 1a. Nieuwe tokens aanwezig
  const newTokens = ['--font-size-xs','--space-1','--radius-sm','--color-accent-light',
    '--color-danger','--shadow-sm','--duration-fast','--duration-normal','--border-strong'];
  const missingNew = newTokens.filter(t => !r.getPropertyValue(t).trim());

  // 1b. Backward-compat aliassen aanwezig (tijdelijk vereist in Fase 1)
  const aliases = ['--surface2','--surface3','--border-hover','--accent2','--accent3'];
  const missingAlias = aliases.filter(t => !r.getPropertyValue(t).trim());

  // 1c. Geen CSS-parseerfouten (stylesheet laadt)
  const sheetLoaded = document.styleSheets.length > 0;

  console.group('GATE-1 — Fase 1: Tokens');
  if (missingNew.length)   console.error('✗ Ontbrekende nieuwe tokens: ' + missingNew.join(', '));
  else                     console.log('%c✓ Nieuwe tokens aanwezig', 'color:green');
  if (missingAlias.length) console.warn('△ Ontbrekende aliassen (nog nodig!): ' + missingAlias.join(', '));
  else                     console.log('%c✓ Backward-compat aliassen aanwezig', 'color:green');
  if (!sheetLoaded)        console.error('✗ Stylesheet niet geladen — CSS-fout?');
  else                     console.log('%c✓ Stylesheet geladen', 'color:green');
  const go = !missingNew.length && !missingAlias.length && sheetLoaded;
  console.log(go ? '%c▶ GO — door naar Fase 2' : '%c✋ NO-GO — herstel fouten eerst',
    go ? 'color:green;font-weight:bold;font-size:14px' : 'color:red;font-weight:bold;font-size:14px');
  console.groupEnd();
})();
```

---

### Fase 2 voltooid? — Typografie

```javascript
// GATE-2 — Mag ik naar Fase 3?
(function gate2() {
  const errors = [];

  // 2a. body font-size
  const bodyFs = getComputedStyle(document.body).fontSize;
  if (bodyFs !== '14px') errors.push(`body font-size: ${bodyFs} (verwacht 14px)`);

  // 2b. thead th: 11px uppercase
  const th = document.querySelector('thead th');
  if (th) {
    const s = getComputedStyle(th);
    if (s.fontSize !== '11px')        errors.push(`th font-size: ${s.fontSize}`);
    if (s.textTransform !== 'uppercase') errors.push(`th text-transform: ${s.textTransform}`);
    if (!['500','600','700'].includes(s.fontWeight)) errors.push(`th font-weight: ${s.fontWeight}`);
  } else errors.push('Geen thead th gevonden');

  // 2c. .cell-primary: 14px
  const cp = document.querySelector('.cell-primary');
  if (cp) {
    if (getComputedStyle(cp).fontSize !== '14px') errors.push('.cell-primary font-size ≠ 14px');
  }

  // 2d. .btn: niet 700
  const btn = document.querySelector('.btn');
  if (btn && getComputedStyle(btn).fontWeight === '700') errors.push('.btn font-weight nog 700');

  // 2e. .label-caps klasse bestaat
  const lc = document.querySelector('.label-caps');
  if (!lc) errors.push('.label-caps klasse niet gevonden in DOM (pas toe op .af-label of .modal-label)');

  console.group('GATE-2 — Fase 2: Typografie');
  errors.forEach(e => console.error('✗ ' + e));
  const go = errors.length === 0;
  if (go) console.log('%c✓ Alle typografiechecks geslaagd', 'color:green;font-weight:bold');
  console.log(go ? '%c▶ GO — door naar Fase 3' : '%c✋ NO-GO',
    go ? 'color:green;font-weight:bold;font-size:14px' : 'color:red;font-weight:bold;font-size:14px');
  console.groupEnd();
})();
```

---

### Fase 3 voltooid? — Kleur

```javascript
// GATE-3 — Mag ik naar Fase 4?
(function gate3() {
  const errors = [];
  const css = [...document.styleSheets].map(s => {
    try { return [...s.cssRules].map(r => r.cssText).join(' '); } catch(e) { return ''; }
  }).join(' ').toLowerCase();

  // 3a. Hardcoded blauwe hover weg
  if (css.includes('#dcf0f5')) errors.push('Hardcoded #DCF0F5 (blauwe btn hover) nog aanwezig');

  // 3b. Hardcoded cyaan row-hover weg
  if (css.includes('#edf8fa')) errors.push('Hardcoded #EDF8FA (cyaan row-hover) nog aanwezig');

  // 3c. Hardcoded groen selected weg
  if (css.includes('#daf2e8')) errors.push('Hardcoded #DAF2E8 (groen selected) nog aanwezig');

  // 3d. Actieve tab: transparante achtergrond
  const activeTab = document.querySelector('.tab.active');
  if (activeTab) {
    const bg = getComputedStyle(activeTab).backgroundColor;
    if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent')
      errors.push(`Tab.active achtergrond niet transparant: ${bg}`);
  }

  // 3e. Row hover kleur niet cyaan
  const rowHover = getComputedStyle(document.documentElement).getPropertyValue('--row-hover').trim();
  if (rowHover.toLowerCase() === '#edf8fa') errors.push('--row-hover is nog cyaan (#EDF8FA)');

  console.group('GATE-3 — Fase 3: Kleur');
  errors.forEach(e => console.error('✗ ' + e));
  const go = errors.length === 0;
  if (go) console.log('%c✓ Alle kleurchecks geslaagd', 'color:green;font-weight:bold');
  console.log(go ? '%c▶ GO — door naar Fase 4' : '%c✋ NO-GO',
    go ? 'color:green;font-weight:bold;font-size:14px' : 'color:red;font-weight:bold;font-size:14px');
  console.groupEnd();
})();
```

---

### Fase 4 voltooid? — Borders & lijnen

```javascript
// GATE-4 — Mag ik naar Fase 5?
(function gate4() {
  const errors = [];

  // 4a. Geen verticale celgrenzen
  const td = document.querySelector('tbody td');
  if (td) {
    const s = getComputedStyle(td);
    if (s.borderLeftWidth !== '0px')  errors.push(`td border-left: ${s.borderLeftWidth} (verwacht 0px)`);
    if (s.borderRightWidth !== '0px') errors.push(`td border-right: ${s.borderRightWidth} (verwacht 0px)`);
  }

  // 4b. thead border-bottom max 1px
  const thead = document.querySelector('thead');
  if (thead) {
    const bw = parseFloat(getComputedStyle(thead).borderBottomWidth);
    if (bw > 1) errors.push(`thead border-bottom: ${bw}px (max 1px)`);
  }

  // 4c. Geen border-radius < 4px op interactieve elementen
  const interactive = [...document.querySelectorAll('.btn,.tab,.tag,.af-chip,input,select')];
  interactive.forEach(el => {
    const br = parseFloat(getComputedStyle(el).borderRadius);
    if (br > 0 && br < 4) errors.push(`${el.className} border-radius: ${br}px (min 4px)`);
  });

  // 4d. Panels en modal: max 6px radius
  [...document.querySelectorAll('.panel,.modal,.ctx-menu,.toast')].forEach(el => {
    const br = parseFloat(getComputedStyle(el).borderTopLeftRadius);
    if (br > 6) errors.push(`${el.className} border-radius: ${br}px (max 6px)`);
  });

  // 4e. .vsep niet zichtbaar
  const vseps = [...document.querySelectorAll('.vsep')];
  const visibleVsep = vseps.filter(el => el.offsetWidth > 0 && getComputedStyle(el).display !== 'none');
  if (visibleVsep.length > 0) errors.push(`${visibleVsep.length} zichtbare .vsep elementen (moeten verborgen zijn)`);

  console.group('GATE-4 — Fase 4: Borders & lijnen');
  errors.forEach(e => console.error('✗ ' + e));
  const go = errors.length === 0;
  if (go) console.log('%c✓ Alle border-checks geslaagd', 'color:green;font-weight:bold');
  console.log(go ? '%c▶ GO — door naar Fase 5' : '%c✋ NO-GO',
    go ? 'color:green;font-weight:bold;font-size:14px' : 'color:red;font-weight:bold;font-size:14px');
  console.groupEnd();
})();
```

---

### Fase 5 voltooid? — Spacing

```javascript
// GATE-5 — Mag ik naar Fase 6?
(function gate5() {
  const errors = [];

  // 5a. Rijhoogte 32px
  const rows = [...document.querySelectorAll('tbody tr')];
  const wrongHeight = rows.filter(r => r.offsetHeight !== 32);
  if (wrongHeight.length > 0) errors.push(`${wrongHeight.length} rijen niet 32px hoog (eerste: ${wrongHeight[0].offsetHeight}px)`);

  // 5b. Toolbar hoogte ~40px
  const toolbar = document.querySelector('.toolbar');
  if (toolbar && (toolbar.offsetHeight < 36 || toolbar.offsetHeight > 44))
    errors.push(`toolbar hoogte: ${toolbar.offsetHeight}px (verwacht ~40px)`);

  // 5c. Panel-header L/R padding gelijk
  const ph = document.querySelector('.panel-header');
  if (ph) {
    const s = getComputedStyle(ph);
    if (s.paddingLeft !== s.paddingRight)
      errors.push(`panel-header padding L(${s.paddingLeft}) ≠ R(${s.paddingRight})`);
  }

  // 5d. Off-grid waarden < 5 (wat resteert is inline/JS-gegenereerd)
  let offGridCount = 0;
  document.querySelectorAll('.btn,.tab,.toolbar,.topbar,.panel-header,.panel-body,.panel-footer').forEach(el => {
    const s = getComputedStyle(el);
    ['paddingTop','paddingRight','paddingBottom','paddingLeft'].forEach(p => {
      const v = parseFloat(s[p]);
      if (v > 0 && v % 4 !== 0) offGridCount++;
    });
  });
  if (offGridCount > 4) errors.push(`${offGridCount} off-grid padding waarden in kerncomponenten (max 4 toegestaan)`);

  console.group('GATE-5 — Fase 5: Spacing');
  errors.forEach(e => console.error('✗ ' + e));
  const go = errors.length === 0;
  if (go) console.log('%c✓ Alle spacing-checks geslaagd', 'color:green;font-weight:bold');
  console.log(go ? '%c▶ GO — door naar Fase 6' : '%c✋ NO-GO',
    go ? 'color:green;font-weight:bold;font-size:14px' : 'color:red;font-weight:bold;font-size:14px');
  console.groupEnd();
})();
```

---

### Fase 6 voltooid? — Schaduwen & animaties

```javascript
// GATE-6 — Mag ik naar Fase 7?
(function gate6() {
  const errors = [];
  const css = [...document.styleSheets].map(s => {
    try { return [...s.cssRules].map(r => r.cssText).join(' '); } catch(e) { return ''; }
  }).join(' ');

  // 6a. slideOut keyframe verwijderd
  if (css.includes('@keyframes slideOut')) errors.push('@keyframes slideOut is nog aanwezig (verwijder)');

  // 6b. Geen zware schaduwen meer (rgba .12 of hoger)
  const heavyShadow = css.match(/rgba\(0,\s*0,\s*0,\s*\.(1[2-9]|[2-9]\d)\)/g);
  if (heavyShadow) errors.push(`Zware schaduw-opaciteit gevonden: ${[...new Set(heavyShadow)].join(', ')}`);

  // 6c. Frozen column: geen box-shadow, wél border-right
  const frozenCss = [...document.styleSheets].map(s => {
    try {
      return [...s.cssRules].filter(r => r.selectorText &&
        (r.selectorText.includes('frozen-col-header') || r.selectorText.includes('frozen-col-body')))
        .map(r => r.cssText).join(' ');
    } catch(e) { return ''; }
  }).join('');
  if (frozenCss.includes('box-shadow') && !frozenCss.includes('none'))
    errors.push('Frozen column heeft nog box-shadow (vervang door border-right)');

  // 6d. Duur-tokens aanwezig
  const r = getComputedStyle(document.documentElement);
  if (!r.getPropertyValue('--duration-fast').trim())   errors.push('--duration-fast ontbreekt');
  if (!r.getPropertyValue('--duration-normal').trim()) errors.push('--duration-normal ontbreekt');

  console.group('GATE-6 — Fase 6: Schaduwen & animaties');
  errors.forEach(e => console.error('✗ ' + e));
  const go = errors.length === 0;
  if (go) console.log('%c✓ Alle schaduw/animatie-checks geslaagd', 'color:green;font-weight:bold');
  console.log(go ? '%c▶ GO — door naar Fase 7' : '%c✋ NO-GO',
    go ? 'color:green;font-weight:bold;font-size:14px' : 'color:red;font-weight:bold;font-size:14px');
  console.groupEnd();
})();
```

---

### Fase 7 voltooid? — Implementatie klaar

```javascript
// GATE-7 — Volledige implementatie gereed?
(function gate7() {
  const errors = [];

  // 7a. Geen gekleurde emoji in toolbar
  const toolbar = document.querySelector('.toolbar');
  if (toolbar) {
    ['🔄','⚡','🎨','❄','🧪','📄','📊'].forEach(e => {
      if (toolbar.innerText.includes(e)) errors.push(`Emoji ${e} nog aanwezig in toolbar`);
    });
  }

  // 7b. Avatar monochroom (geen inline background met non-gray kleur)
  [...document.querySelectorAll('.avatar')].forEach((av, i) => {
    const bg = (av.style.background || av.style.backgroundColor || '').toLowerCase();
    if (bg && !bg.includes('gray') && !bg.includes('#d') && !bg.match(/#[89a-f][0-9a-f]{5}/i)) {
      errors.push(`Avatar ${i+1} heeft gekleurde achtergrond: ${bg}`);
    }
  });

  // 7c. Backward-compat aliassen verwijderd (Fase 1 aliassen zijn niet meer nodig)
  const r = getComputedStyle(document.documentElement);
  ['--surface2','--surface3','--border-hover','--input-border',
   '--accent2','--accent3','--accent4','--shadow-1','--shadow-2'].forEach(t => {
    if (r.getPropertyValue(t).trim()) errors.push(`Verouderd alias ${t} nog aanwezig`);
  });

  // 7d. Alle vorige gate-criteria nog steeds geldig (spot check)
  const th = document.querySelector('thead th');
  if (th && getComputedStyle(th).textTransform !== 'uppercase')
    errors.push('Regressie: thead th niet meer uppercase');
  const td = document.querySelector('tbody td');
  if (td && getComputedStyle(td).borderLeftWidth !== '0px')
    errors.push('Regressie: td heeft weer border-left');

  console.group('GATE-7 — Implementatie voltooid');
  errors.forEach(e => console.error('✗ ' + e));
  const go = errors.length === 0;
  if (go) {
    console.log('%c✓ Alle fasen succesvol afgerond', 'color:green;font-weight:bold');
    console.log('%c🏁 IMPLEMENTATIE KLAAR — voer RC1–RC8 regressiecheck uit', 'color:green;font-size:14px');
  } else {
    console.log('%c✋ NO-GO — herstel bovenstaande punten', 'color:red;font-weight:bold;font-size:14px');
  }
  console.groupEnd();
})();
```

---

## 11. Performance tests

### Overzicht meetpunten

| Metriek | Instrument | Drempelwaarde |
|---|---|---|
| First Contentful Paint | `PerformanceObserver` | < 500ms (lokaal bestand) |
| CSS-regeltal | `document.styleSheets` | < 600 regels |
| Stylesheet grootte | `cssRules` totaal | < 40 KB |
| Unieke font-sizes | DOM-scan | ≤ 4 |
| Token-count | `:root` properties | ≤ 42 |
| Off-grid padding | DOM-scan | < 5 |
| Hardcoded kleuren | CSS-tekst scan | 0 |
| Scroll-FPS (60 rijen) | `requestAnimationFrame` | ≥ 55 fps gemiddeld |
| Hover-reactietijd | `performance.now()` | < 16ms (één frame) |
| JS-heap geheugen | `performance.memory` | < 30 MB |
| Lange taken (> 50ms) | `PerformanceObserver` | 0 bij laden |

---

### P1 — Paint timing (FCP)

```javascript
// P1 — First Contentful Paint meten
// Voer uit DIRECT na het laden van de pagina (of na hard refresh Ctrl+Shift+R)
const paints = performance.getEntriesByType('paint');
if (paints.length === 0) {
  console.warn('△ P1 — Geen paint entries. Doe Ctrl+Shift+R en voer dit script direct daarna uit.');
} else {
  paints.forEach(p => {
    const ms = Math.round(p.startTime);
    const ok = ms < 500;
    const icon = ok ? '✓' : '✗';
    const style = ok ? 'color:green;font-weight:bold' : 'color:red;font-weight:bold';
    console.log(`%c${icon} ${p.name}: ${ms}ms ${ok ? '(snel)' : '(langzaam — drempel: 500ms)'}`, style);
  });
}
```

**Verwacht (lokaal bestand, geen netwerkvertraging):**
- `first-paint` < 300ms
- `first-contentful-paint` < 500ms

---

### P2 — CSS stylesheet grootte & regelcount

```javascript
// P2 — Stylesheet audit: grootte en aantal regels
let totalRules = 0;
let totalChars = 0;
[...document.styleSheets].forEach((sheet, i) => {
  try {
    const rules = [...sheet.cssRules];
    const text = rules.map(r => r.cssText).join('\n');
    totalRules += rules.length;
    totalChars += text.length;
    console.log(`Stylesheet ${i+1}: ${rules.length} regels, ~${Math.round(text.length/1024*10)/10} KB`);
  } catch(e) {
    console.warn(`Stylesheet ${i+1}: geen toegang (cross-origin of Google Fonts)`);
  }
});
const kb = Math.round(totalChars / 1024 * 10) / 10;
console.log('─'.repeat(50));
const rulesOk = totalRules < 600;
const sizeOk  = kb < 40;
console.log(`%cTotaal regels: ${totalRules} ${rulesOk ? '✓' : '✗ (drempel: 600)'}`,
  rulesOk ? 'color:green' : 'color:red');
console.log(`%cTotaal grootte: ${kb} KB ${sizeOk ? '✓' : '✗ (drempel: 40 KB)'}`,
  sizeOk ? 'color:green' : 'color:red');
```

---

### P3 — CSS token-count (DESIGN_PLAN §2 doelstelling)

```javascript
// P3 — Verifieer tokenreductie: voor=65+, doel=42
const allTokens = [...document.styleSheets].flatMap(s => {
  try {
    return [...s.cssRules]
      .filter(r => r.selectorText === ':root')
      .flatMap(r => [...r.style].filter(p => p.startsWith('--')));
  } catch(e) { return []; }
});
const count = allTokens.length;
const target = 42;
const ok = count <= target;
console.log(`%c${ok ? '✓' : '△'} CSS custom properties: ${count} (doel: ≤${target})`,
  ok ? 'color:green;font-weight:bold' : 'color:orange;font-weight:bold');
if (!ok) {
  console.log(`  Surplus van ${count - target} tokens. Kandidaten om te verwijderen:`);
  // Toon kleurschaal-tokens die wegkunnen
  const surplus = allTokens.filter(t =>
    t.match(/--(?:green|red|blue|orange|yellow|magenta)-\d+/) ||
    ['--cta','--cta-hover','--cta-bg','--color-ui-active'].includes(t)
  );
  surplus.forEach(t => console.log('  ' + t));
}
```

---

### P4 — Unieke font-sizes (doel: 4)

```javascript
// P4 — Tel unieke font-sizes in gebruik op zichtbare elementen
const sizes = new Set();
document.querySelectorAll('*').forEach(el => {
  if (!el.checkVisibility || el.checkVisibility({visibilityProperty: true})) {
    sizes.add(getComputedStyle(el).fontSize);
  }
});
const count = sizes.size;
const target = 6; // 4 formeel + kleine uitzonderingen tolerantie
const ok = count <= target;
console.log(`%c${ok ? '✓' : '✗'} Unieke font-sizes: ${count} (doel: ≤4, tolerantie: ≤6)`,
  ok ? 'color:green;font-weight:bold' : 'color:red;font-weight:bold');
console.log('Gevonden sizes:', [...sizes].sort((a,b) => parseFloat(a)-parseFloat(b)).join(', '));
```

---

### P5 — Scroll performance (FPS-meting)

```javascript
// P5 — Meet frames per second tijdens scrollen
// Stap 1: Voer dit script uit
// Stap 2: Scroll snel door de tabel gedurende 2 seconden
// Stap 3: Resultaat verschijnt automatisch

(function measureFPS() {
  let frames = 0;
  let start = null;
  const duration = 2000; // 2 seconden meten

  function tick(timestamp) {
    if (!start) start = timestamp;
    frames++;
    if (timestamp - start < duration) {
      requestAnimationFrame(tick);
    } else {
      const fps = Math.round(frames / (duration / 1000));
      const ok = fps >= 55;
      console.log(
        `%c${ok ? '✓' : '✗'} Gemiddeld FPS: ${fps} (drempel: ≥55 fps)`,
        ok ? 'color:green;font-weight:bold' : 'color:red;font-weight:bold'
      );
      if (!ok) console.log('  Oorzaak: zware CSS-transitions, te veel DOM-nodes, of zware repaints');
    }
  }

  console.log('△ P5 — Scroll nu door de tabel (2 seconden meten)...');
  requestAnimationFrame(tick);
})();
```

---

### P6 — Hover-reactietijd (één rij)

```javascript
// P6 — Meet hoe snel een rij reageert op hover (CSS transition moet < 1 frame zijn)
// Methode: simuleer een classList-wijziging en meet layout-tijd

const row = document.querySelector('tbody tr');
if (!row) {
  console.warn('△ P6 — Geen tbody tr gevonden');
} else {
  const t0 = performance.now();
  row.classList.add('hovered-test');  // trigger reflow
  void row.offsetHeight;              // forceer layout-flush
  row.classList.remove('hovered-test');
  const t1 = performance.now();
  const ms = Math.round((t1 - t0) * 100) / 100;
  const ok = ms < 2;
  console.log(
    `%c${ok ? '✓' : '△'} Rij classList-wijziging: ${ms}ms (drempel: <2ms)`,
    ok ? 'color:green;font-weight:bold' : 'color:orange;font-weight:bold'
  );
  console.log('  (CSS hover-transition voegt hier de animatieduur aan toe: ~100ms bij --duration-fast)');
}
```

---

### P7 — Lange taken detecteren (bij pageload)

```javascript
// P7 — Detecteer JavaScript-taken langer dan 50ms (Long Tasks API)
// BELANGRIJK: voer dit script uit VOOR je de pagina laadt
// (of open een nieuw tabblad, plak dit als eerste, dan navigeer naar dashboard.html)

// Als de pagina al geladen is, gebruik deze retrospectieve meting:
const navEntry = performance.getEntriesByType('navigation')[0];
if (navEntry) {
  const loadTime = Math.round(navEntry.loadEventEnd - navEntry.startTime);
  const domReady = Math.round(navEntry.domContentLoadedEventEnd - navEntry.startTime);
  const ok = loadTime < 1000;
  console.log(`%c${ok ? '✓' : '△'} Pagina load tijd: ${loadTime}ms (doel: <1000ms lokaal)`,
    ok ? 'color:green' : 'color:orange');
  console.log(`  DOM gereed: ${domReady}ms`);
  console.log(`  Serverrespons: ${Math.round(navEntry.responseEnd - navEntry.requestStart)}ms`);
} else {
  console.warn('△ P7 — Geen navigatie-entry beschikbaar');
}

// Voor actieve Long Task monitoring (werkt alleen als je dit VÓÓr het laden uitvoert):
try {
  const longTasks = [];
  new PerformanceObserver(list => {
    list.getEntries().forEach(entry => {
      longTasks.push({duration: Math.round(entry.duration) + 'ms', start: Math.round(entry.startTime) + 'ms'});
      console.warn(`⚠ Lange taak: ${Math.round(entry.duration)}ms op t=${Math.round(entry.startTime)}ms`);
    });
  }).observe({ entryTypes: ['longtask'] });
  console.log('△ P7 — Long Task observer actief (werkt na interacties zoals filter openen)');
} catch(e) {
  console.warn('△ P7 — Long Tasks API niet beschikbaar in deze context');
}
```

---

### P8 — Geheugengebruik (JS heap)

```javascript
// P8 — JavaScript heap geheugen
if (!performance.memory) {
  console.warn('△ P8 — performance.memory niet beschikbaar.');
  console.log('  Activeer via: chrome://flags/#enable-precise-memory-info');
} else {
  const used   = Math.round(performance.memory.usedJSHeapSize   / 1024 / 1024 * 10) / 10;
  const total  = Math.round(performance.memory.totalJSHeapSize  / 1024 / 1024 * 10) / 10;
  const limit  = Math.round(performance.memory.jsHeapSizeLimit  / 1024 / 1024 * 10) / 10;
  const okUsed = used < 30;
  console.log(`%c${okUsed ? '✓' : '△'} JS heap gebruikt: ${used} MB (doel: <30 MB)`,
    okUsed ? 'color:green;font-weight:bold' : 'color:orange;font-weight:bold');
  console.log(`  Gealloceerd: ${total} MB`);
  console.log(`  Limiet:      ${limit} MB`);
  console.log(`  Benutting:   ${Math.round(used/limit*100)}%`);
}
```

---

### P9 — DOM-omvang (complexiteit)

```javascript
// P9 — DOM-node count en nesting-diepte
const allNodes = document.querySelectorAll('*').length;
const okNodes  = allNodes < 3000;

// Bereken maximale nesting-diepte
function depth(el, d = 0) {
  return el.children.length ? Math.max(...[...el.children].map(c => depth(c, d+1))) : d;
}
const maxDepth = depth(document.body);
const okDepth  = maxDepth < 20;

console.log(`%c${okNodes ? '✓' : '△'} DOM-nodes: ${allNodes} (doel: <3000)`,
  okNodes ? 'color:green' : 'color:orange');
console.log(`%c${okDepth ? '✓' : '△'} Max nesting-diepte: ${maxDepth} (doel: <20)`,
  okDepth ? 'color:green' : 'color:orange');

// Zoek naar de diepste keten
let deepest = document.body;
let cur = document.body;
while (cur.children.length) {
  cur = [...cur.children].reduce((a, b) =>
    (b.querySelectorAll('*').length > a.querySelectorAll('*').length ? b : a));
  deepest = cur;
}
console.log(`  Diepste tak: ${deepest.tagName}.${[...deepest.classList].join('.')}`);
```

---

### P10 — Volledige performance-snapshot (combineer alles)

```javascript
// P10 — Snel overzicht van alle performance-metrieken
(async function perfSnapshot() {
  console.group('⚡ Performance Snapshot');

  // Stylesheet grootte
  let cssChars = 0, cssRules = 0;
  [...document.styleSheets].forEach(s => {
    try { const r = [...s.cssRules]; cssRules += r.length; cssChars += r.map(x=>x.cssText).join('').length; }
    catch(e) {}
  });

  // Font-sizes
  const fontSizes = new Set([...document.querySelectorAll('*')].map(el => getComputedStyle(el).fontSize));

  // Tokens
  const tokens = [...document.styleSheets].flatMap(s => {
    try { return [...s.cssRules].filter(r=>r.selectorText===':root').flatMap(r=>[...r.style].filter(p=>p.startsWith('--'))); }
    catch(e) { return []; }
  });

  // Off-grid padding
  let offGrid = 0;
  document.querySelectorAll('.btn,.tab,.toolbar,.topbar,.panel-header,.panel-body').forEach(el => {
    ['paddingTop','paddingRight','paddingBottom','paddingLeft'].forEach(p => {
      const v = parseFloat(getComputedStyle(el)[p]);
      if (v > 0 && v % 4 !== 0) offGrid++;
    });
  });

  // Hardcoded kleuren
  const css = [...document.styleSheets].map(s => { try { return [...s.cssRules].map(r=>r.cssText).join(' '); } catch(e){return '';} }).join('').toLowerCase();
  const hardcoded = ['#dcf0f5','#edf8fa','#daf2e8','#eff4f6','#ffffff'].filter(c => css.includes(c));

  // Navigatie-timing
  const nav = performance.getEntriesByType('navigation')[0];
  const loadMs = nav ? Math.round(nav.loadEventEnd - nav.startTime) : null;

  // DOM
  const domCount = document.querySelectorAll('*').length;

  // Resultaten
  const rows = [
    { metriek: 'CSS regels',         waarde: cssRules,                    doel: '< 600',   ok: cssRules < 600 },
    { metriek: 'CSS grootte (KB)',    waarde: Math.round(cssChars/1024),   doel: '< 40',    ok: cssChars/1024 < 40 },
    { metriek: 'Design tokens',       waarde: tokens.length,               doel: '≤ 42',    ok: tokens.length <= 42 },
    { metriek: 'Unieke font-sizes',   waarde: fontSizes.size,              doel: '≤ 6',     ok: fontSizes.size <= 6 },
    { metriek: 'Off-grid padding',    waarde: offGrid,                     doel: '< 5',     ok: offGrid < 5 },
    { metriek: 'Hardcoded kleuren',   waarde: hardcoded.length,            doel: '0',       ok: hardcoded.length === 0 },
    { metriek: 'DOM nodes',           waarde: domCount,                    doel: '< 3000',  ok: domCount < 3000 },
    { metriek: 'Load tijd (ms)',      waarde: loadMs ?? 'n/a',             doel: '< 1000',  ok: loadMs === null || loadMs < 1000 },
  ];

  console.table(rows.map(r => ({
    '': r.ok ? '✓' : '✗',
    Metriek: r.metriek,
    Waarde: r.waarde,
    Doel: r.doel
  })));

  const failed = rows.filter(r => !r.ok);
  if (failed.length === 0) {
    console.log('%c✓ Alle performance-targets gehaald', 'color:green;font-weight:bold;font-size:14px');
  } else {
    console.warn(`△ ${failed.length} target(s) niet gehaald: ${failed.map(r=>r.metriek).join(', ')}`);
  }
  console.groupEnd();
})();
```

---

## Samenvatting testresultaten

Gebruik deze tabel om je voortgang bij te houden:

| Test | Beschrijving | Status |
|---|---|---|
| T1.1 | Alle nieuwe tokens aanwezig | ☐ |
| T1.2 | Verwijderde tokens zijn weg | ☐ |
| T1.3 | Token waarden kloppen | ☐ |
| T2.1 | Kolomheaders 11px/uppercase | ☐ |
| T2.2 | cell-primary 14px/500 | ☐ |
| T2.3 | Geen verboden font-sizes | ☐ |
| T2.4 | Geen font-weight 700 op btn/tab | ☐ |
| T3.1 | Row hover is grijs | ☐ |
| T3.2 | Knop hover is grijs | ☐ |
| T3.3 | Actieve tab transparante bg | ☐ |
| T3.4 | Aggregatierij niet groen | ☐ |
| T3.5 | Geen hardcoded kleuren in CSS | ☐ |
| T4.1 | Rijhoogte 32px | ☐ |
| T4.2 | Geen verticale celgrenzen | ☐ |
| T4.3 | Border-radius consistent | ☐ |
| T4.4 | thead border-bottom 1px | ☐ |
| T5.1 | Spacing op 4px-grid | ☐ |
| T5.2 | Checkbox-kolom 40px | ☐ |
| T5.3 | Panel padding uniform | ☐ |
| T7.1 | Geen emoji in toolbar | ☐ |
| T7.2 | Avatar monochroom | ☐ |
| RC1–RC8 | Alle functionele tests | ☐ |
| **IMPLEMENTATIEPLAN** | | |
| GATE-1 | Tokens aanwezig + aliassen actief | ☐ |
| GATE-2 | Typografie correct (11/12/14px, weights) | ☐ |
| GATE-3 | Kleuren clean (geen hardcoded, tab transparant) | ☐ |
| GATE-4 | Borders correct (0px vertical, radius 4/6px) | ☐ |
| GATE-5 | Spacing op 4px-grid, rijhoogte 32px | ☐ |
| GATE-6 | Schaduwen subtiel, slideOut weg, duraties tokens | ☐ |
| GATE-7 | Implementatie volledig (aliassen weg, emoji weg) | ☐ |
| **PERFORMANCE** | | |
| P1 | First Contentful Paint < 500ms | ☐ |
| P2 | CSS regels < 600, grootte < 40 KB | ☐ |
| P3 | Design tokens ≤ 42 | ☐ |
| P4 | Unieke font-sizes ≤ 6 | ☐ |
| P5 | Scroll FPS ≥ 55 | ☐ |
| P6 | Hover latency < 2ms | ☐ |
| P7 | Pagina load < 1000ms, 0 lange taken | ☐ |
| P8 | JS heap < 30 MB | ☐ |
| P9 | DOM nodes < 3000, nesting < 20 | ☐ |
| P10 | Volledig performance-snapshot groen | ☐ |

**Acceptatiecriterium:** Alle T-tests geslaagd. RC-tests: geen rode console-errors.
