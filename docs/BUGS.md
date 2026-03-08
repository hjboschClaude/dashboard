# Bug Tracker — Dashboard

Nummering sluit aan op codebase: laatste bekende bug was BUG-015.

---

## BUG-016 — Sortering werkt niet op kolommen Verantwoordelijke Directeur en Ambtelijk Opdrachtgever

| | |
|---|---|
| **ID** | `BUG-016` |
| **Status** | Opgelost |
| **Ernst** | Middel |
| **Gemeld** | 07-03-2026 |
| **Opgelost** | 07-03-2026 |
| **Versie** | v0.34.0 |
| **Component** | Tabelheader — klik-sort |

### Beschrijving

Klikken op de kolomheader van **Verantwoordelijke Directeur** (`key: directeur`) of **Ambtelijk Opdrachtgever** (`key: aog`) triggert geen zichtbare sortering. Er verschijnt geen sorteerindicator (↑ / ↓) in de header en de rijvolgorde verandert niet.

Andere kolommen (Projectnaam, Status, Prioriteit, Deadline, Budget) sorteren wél correct.

### Reproductiestappen

1. Open het dashboard
2. Scroll naar de kolom **Verantwoordelijke Directeur**
3. Klik op de kolomheader
4. **Verwacht:** sorteerindicator ↑ verschijnt, rijen sorteren alfabetisch op directeur
5. **Werkelijk:** geen indicator, geen herordening
6. Herhaal voor **Ambtelijk Opdrachtgever** — zelfde gedrag

### Technische analyse

**Betrokken code:**

```javascript
// clickSort — renderHeader (th onclick)
function clickSort(key){
  if(thDidDrag){thDidDrag=false;return;}   // ← mogelijke oorzaak
  var ex=AppState.sortRules.findIndex(function(r){return r.field===key;});
  if(ex>=0){
    AppState.sortRules[ex].dir=_toggleSortDir(AppState.sortRules[ex].dir);
  } else {
    AppState.sortRules.unshift({field:key,dir:'asc'});
  }
  ...
  render();
}
```

**Hypothese A — drag-event interferentie (meest waarschijnlijk):**
De `th`-elementen hebben `draggable="true"` voor kolom-herordening. De kolom-iconen van `directeur` (`👔`) en `aog` (`📋`) zijn emoji. Sommige browsers starten bij klikken op een emoji automatisch een native drag-operatie, wat `ondragstart` triggert en `thDidDrag = true` zet. De daaropvolgende `onclick` vindt dan `thDidDrag === true`, bail out vroegtijdig en sorteert niet.

Kolommen met niet-emoji iconen zoals `Aa`, `◉`, `⚑` hebben dit probleem niet.

**Hypothese B — avatar-cache stale render:**
De `avatarCell()` functie gebruikt een `Map`-cache (`_avatarCache`). Na een sort-trigger wordt de tabel herbouwd, maar als de cache de exacte dezelfde HTML-strings teruggeven voor dezelfde namen, zou een incrementele DOM-update de celinhoud niet wisselen en lijkt de sortering niet te werken (rijen staan visueel op dezelfde plek).

**Hypothese C — herhaalde waarden:**
Directeur heeft slechts 6 unieke waarden voor 50 rijen (~8 rijen per directeur). Na sortering kan het zichtbare venster er identiek uitzien als de gesorteerde rijen toevallig overeenkomen met de oorspronkelijke volgorde. Technisch sorteert het wél, maar is dit niet zichtbaar.

### Getroffen kolommen

| Kolom | Key | Icon | Renderer |
|---|---|---|---|
| Verantwoordelijke Directeur | `directeur` | 👔 | `avatar` |
| Ambtelijk Opdrachtgever | `aog` | 📋 | `avatar` |

### Toegepaste fix

**Oorzaak bevestigd:** Hypothese A. Browser-native drag op emoji-karakter in `draggable="true"` `th` triggerde `thDragStart()` → `thDidDrag=true` → `clickSort()` bail-out.

**Fix:** `pointer-events:none;user-select:none` toegevoegd aan `.col-type-icon` in CSS:
```css
.col-type-icon{font-size:12px;opacity:.6;pointer-events:none;user-select:none;}
```

- `pointer-events:none` → klikken op icon-span gaat naar de `th`, niet de emoji; browser start geen native drag op het icon-element
- `user-select:none` → emoji-karakter is niet selecteerbaar, voorkomt selectie-gebaseerde drag
- Werkt voor **alle** emoji-iconen in kolomheaders (niet alleen directeur/aog)
- Kolom-reordering via drag-and-drop blijft werken (de `th` is nog steeds `draggable="true"`)

---

## BUG-017 — Bevriezen: eerste datakolom blijft niet staan bij horizontaal scrollen

| | |
|---|---|
| **ID** | `BUG-017` |
| **Status** | Opgelost |
| **Ernst** | Hoog |
| **Gemeld** | 07-03-2026 |
| **Opgelost** | 07-03-2026 |
| **Versie** | v0.34.0 |
| **Component** | Kolom bevriezen — `toggleFreeze` / CSS `position:sticky` |

### Beschrijving

Na het activeren van **Bevriezen** via de toolbarknop meldt de toast "Eerste kolom bevroren" en de knop toont de actieve staat. Echter: bij horizontaal scrollen in de tabel schuift de **Projectnaam**-kolom mee naar links en verdwijnt gedeeltelijk uit beeld. De kolom is niet vastgezet.

### Reproductiestappen

1. Open het dashboard (voldoende kolommen zichtbaar zodat horizontaal scrollen mogelijk is)
2. Klik op **Bevriezen** in de toolbar
3. Toast verschijnt: "Eerste kolom bevroren" — de knop staat actief (groen)
4. Scroll horizontaal naar rechts
5. **Verwacht:** kolom Projectnaam blijft zichtbaar aan de linkerkant (sticky, positie `left:44px`)
6. **Werkelijk:** kolom scrollt mee en verdwijnt gedeeltelijk — linkerrand van de tekst wordt afgesneden

### Visueel bewijs

Screenshot toont rijnamen als "...creatie Lab", "...biliteitshub West" — het begin van "Innovatie" / "Mobiliteit" is weggescrold, wat bevestigt dat de kolom niet vast staat.

### Technische analyse

**Betrokken code:**

```javascript
function toggleFreeze(){
  AppState.freezeCol=!AppState.freezeCol;
  AppState.ui.freezeFirstDataColumn=AppState.freezeCol;
  document.getElementById('btn-freeze').classList.toggle('active',AppState.freezeCol);

  // Stap 1: klasse zetten op HUIDIGE containers
  document.querySelectorAll('.table-container').forEach(function(tc){
    tc.classList.toggle('freeze-active',AppState.freezeCol);
  });

  // Stap 2: volledige re-render (OVERSCHRIJFT mogelijk Stap 1)
  _invalidate(['header','body','widths']);
  render();

  toast(AppState.freezeCol?'Eerste kolom bevroren':'Bevriezen uitgeschakeld');
}
```

**Werkelijke oorzaak (vastgesteld bij fix) — inline style overschrijft CSS-sticky:**
De `td` voor de `name`-kolom werd gerenderd met `style="position:relative"` als inline stijl (in `rowHtml()`). Inline stijlen hebben CSS-specificiteit `(1,0,0,0)`, hoger dan elke class-selector. De freeze-CSS-regel `.table-container.freeze-active table tbody td:nth-child(2){position:sticky}` had specificiteit `(0,3,3)` en verloor daardoor altijd van de inline stijl. Resultaat: `position:sticky` had geen effect.

De hypothese over class-verlies na `render()` bleek niet de oorzaak: `renderHeader()` en `renderVirtualBody()` vervangen alleen `thead-row.innerHTML` resp. `tbody.innerHTML`, niet het `.table-container`-element zelf. De klasse overleeft `render()`.

**Aanvullend probleem — hardcoded achtergrond:**
```css
.table-container.freeze-active table tbody td:nth-child(2){
  position:sticky;
  left:44px;
  z-index:4;
  background:#FFFFFF; /* ← hardcoded wit, niet var(--bg) */
}
```
Bij dark-mode of alternatieve thema's zou de bevroren kolom een witte achtergrond tonen terwijl de rest van de tabel een andere kleur heeft.

**CSS-sticky vereisten (checklist):**
- [x] `overflow:auto` op `.table-container` ✓
- [x] `border-collapse:separate` op `table` ✓ (BUG-014/015)
- [x] `position:sticky` + `left:44px` op `td:nth-child(2)` ✓
- [x] `z-index:4` (hoger dan standaard td) ✓
- [x] `freeze-active` klasse overleeft `render()` ✓ (containers worden niet vervangen)
- [x] Geen inline `style` die `position:sticky` overschrijft ✓ (opgelost)

### Toegepaste fix

**Stap 1 — root cause:** `position:relative` verplaatst van inline `style=""` naar CSS-klasse `.cell-primary`:
```css
.cell-primary{position:relative;} /* was: style="position:relative" inline op <td> */
```
```javascript
// rowHtml() — voor:
return '<td class="'+cls+'"'+(c.key==='name'?' style="position:relative"':'')+'>'+cell+'</td>';
// rowHtml() — na:
return '<td class="'+cls+'">'+cell+'</td>';
```

**Stap 2 — achtergrond:** `background:#FFFFFF` → `background:var(--bg)` in freeze-CSS.

**Stap 3 — defensief:** `freeze-active`-class NA `render()` zetten in `toggleFreeze()` (ter bescherming tegen toekomstige render-refactors).

---

---

## BUG-018 — Unit test `getRowH: compact → 34` faalt

| | |
|---|---|
| **ID** | `BUG-018` |
| **Status** | Opgelost |
| **Ernst** | Laag |
| **Gemeld** | 08-03-2026 |
| **Opgelost** | 08-03-2026 |
| **Versie** | v0.36.0 |
| **Component** | Suite A — `runTests()` → A-ROW |

### Beschrijving

De unit test `getRowH: compact → 34` faalt. De assert verwacht dat `getRowH()` retourneert `34` wanneer `AppState.rowHeight === 'compact'`, maar de werkelijke waarde is `32`. De compacte rijhoogte was eerder gewijzigd van 34 naar 32px zonder de test mee te updaten.

### Oorzaak

`getRowH()` retourneert `32` als default (niet-tall, niet-medium). De assert verwachtte nog de oude waarde `34`.

### Toegepaste fix

Assert aangepast: `getRowH()===34` → `getRowH()===32`.

---

*Laatst bijgewerkt: 08-03-2026 — Dashboard v0.36.0*
