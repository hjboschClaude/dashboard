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

**Acceptatiecriterium:** Alle T-tests geslaagd. RC-tests: geen rode console-errors.
