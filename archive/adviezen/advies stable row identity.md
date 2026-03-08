Hier is de volledige uitwerking van \*\*stabiele row identity afdwingen\*\*.



De aanleiding is concreet zichtbaar in het bestand. De state bewaart selectie in `selectedRows: new Set()` en `contextRow`, terwijl contextmenu en modal werken met sleutels als `tab-id` en vervolgens records ophalen via `x.id===id`; ook de modal-title valt terug op `r.name || String(r.id)`. Tegelijk zijn er tests voor selectiepersistentie na filteren, plus virtualisatie, grouping en tabswitching. Dat is precies de combinatie waarbij identity niet impliciet mag zijn.   



\# 1. Doel



De hoofdregel moet worden:



\*\*Elke record-identiteit is een expliciete, stabiele, unieke, tab-lokale sleutel die losstaat van zichtvolgorde, array-index, DOM-positie, sortering, filtering, grouping en virtualisatie.\*\*



Dus niet:



\* index in de array

\* index in de gefilterde lijst

\* DOM row position

\* “tabnummer + arraypositie”

\* objectreferentie



Maar wel:



\* een vaste primary key uit het schema-contract

\* of, als tijdelijke fallback, een bij init gegenereerde immutable engine key



\# 2. Waarom dit nodig is



In de huidige code zie je al dat selectie, contextmenu en modal aan identity hangen:



\* `AppState.selectedRows` is een `Set`

\* `AppState.contextRow` bewaart de actieve rij

\* `showCtx(e,key)` voegt die key direct aan `selectedRows` toe

\* `expandRow()` splitst de key en roept `openModal(tab,id)` aan

\* `openModal(tab,id)` zoekt vervolgens het record via `x.id===id`  



Dat is beter dan puur op zichtindex werken, maar nog niet robuust genoeg, omdat het model nu nog sterk leunt op:



\* aanwezigheid van `id`

\* parse van een samengestelde string

\* impliciete koppeling tussen tabindex en record-id

\* veldnamen `id` en `name` in de modal 



Zodra je nieuwe schema’s, AI-gegenereerde configs of datasets met andere sleutelvelden krijgt, ontstaan stille fouten:



\* verkeerde rij blijft geselecteerd na sorteren

\* contextmenu opent ander record dan gebruiker verwacht

\* selectie-export neemt de verkeerde records mee

\* virtualisatie toont checkbox aangevinkt op een andere zichtbare rij

\* tabswitch herstelt selectie verkeerd



\# 3. Ontwerpregel



Ik raad een \*\*drie-laags identity-model\*\* aan:



\## Laag A — Business key



De echte record-id uit de dataset, bijvoorbeeld:



\* `projectId`

\* `medewerkerId`

\* `kostenplaatsCode`



Deze komt uit `schemaContract.primaryKey`.



\## Laag B — Engine row key



Een gestandaardiseerde, altijd-stringified sleutel die de engine intern gebruikt:



```text

<tabId>::<primaryKeyValue>

```



Bijvoorbeeld:



\* `projects::P-1042`

\* `teamleden::88431`



\## Laag C — Row reference object



Voor interne functies liever geen losse strings meer, maar een objectmodel:



```js

{

&nbsp; tabId: "projects",

&nbsp; recordId: "P-1042",

&nbsp; rowKey: "projects::P-1042"

}

```



Zo voorkom je overal `split('-')` of andere parsing.



\# 4. Wat “stabiel” hier exact betekent



Een row identity is stabiel als hij \*\*niet verandert\*\* bij:



\* filter toepassen of wissen

\* sorteren asc/desc/multi-sort

\* grouping en collapse/expand

\* virtual scroll window verschuiven

\* tab switch en restore

\* re-render

\* column reorder/hide/freeze

\* export van current view of selectie

\* asynchrone reload van data, zolang het om hetzelfde record gaat



Dus: dezelfde record moet na elke view-mutatie dezelfde `rowKey` houden.



\# 5. Nieuwe contractregel



Dit moet onderdeel worden van het schema-contract uit de vorige stap.



Per tab verplicht:



```js

schemaContract: {

&nbsp; primaryKey: "projectId",

&nbsp; semanticFields: {

&nbsp;   primaryLabel: "projectNaam",

&nbsp;   detailTitle: "projectNaam"

&nbsp; }

}

```



En extra identity-eisen:



\* `primaryKey` moet bestaan in schema

\* `primaryKey` mag niet nullable zijn

\* `primaryKey` moet uniek zijn binnen de tabdataset

\* `primaryKey` type mag alleen `text` of `number` zijn

\* na normalisatie moet de key nog uniek blijven



Dat sluit aan op de eerdere noodzaak om features als multi-select, contextmenu en modal alleen toe te staan als de sleutel echt valide is. De huidige code gebruikt selectie, contextmenu en modal al als kernonderdelen van de view state en interactielaag.   



\# 6. Identity-normalisatie



Maak één centrale normalisatiefunctie:



```js

function normalizeRecordId(value) {

&nbsp; if (value === null || value === undefined) return null;

&nbsp; if (typeof value === 'number') return String(value);

&nbsp; if (typeof value === 'string') return value.trim();

&nbsp; return String(value);

}

```



En één builder:



```js

function makeRowKey(tabId, recordId) {

&nbsp; var rid = normalizeRecordId(recordId);

&nbsp; if (!tabId || rid === null || rid === '') return null;

&nbsp; return tabId + '::' + rid;

}

```



Belangrijke regel:



\* \*\*geen parsebare delimiter kiezen die ook betekenisvol is in data zonder escaping\*\*

\* veiliger is nog een objectmap met nested sets, maar string keys zijn praktisch prima als centraal beheerd



\# 7. Geen identity meer op tab-index + id-parse



Nu zie je:



```js

function expandRow(){

&nbsp; if(!AppState.contextRow) return;

&nbsp; var tab=parseInt(AppState.contextRow.split('-')\[0]);

&nbsp; var id=parseInt(AppState.contextRow.split('-')\[1]);

&nbsp; openModal(tab,id);

}

```



Dit is kwetsbaar:



\* tab wordt afgeleid uit positie, niet uit stabiele `tabId`

\* id wordt `parseInt`, dus tekstsleutels gaan stuk

\* leading zeros gaan verloren

\* niet-numerieke sleutels worden onbruikbaar 



Dat moet worden vervangen door:



```js

function parseRowKey(rowKey) {

&nbsp; var parts = String(rowKey).split('::');

&nbsp; return { tabId: parts\[0], recordId: parts.slice(1).join('::') };

}

```



Of beter nog: contextstate niet als string parsebaar opslaan, maar als object:



```js

AppState.contextRowRef = {

&nbsp; tabId: "projects",

&nbsp; recordId: "P-1042",

&nbsp; rowKey: "projects::P-1042"

};

```



\# 8. Centrale index per tab



Voor performance én correctness raad ik een index aan per tab:



```js

\_tabIndexById = {

&nbsp; projects: new Map(\[

&nbsp;   \["P-1042", rowObject],

&nbsp;   \["P-1043", rowObject]

&nbsp; ])

};

```



of:



```js

\_tabRowKeyToRecord = {

&nbsp; projects: new Map(\[

&nbsp;   \["projects::P-1042", rowObject]

&nbsp; ])

};

```



Waarom:



\* modal openen hoeft niet lineair `find()` door alle data te doen

\* selectie-export kan exact records ophalen

\* virtualisatie hoeft nooit te vertrouwen op zichtindex

\* duplicate-key check is direct mogelijk



Dat is relevanter omdat de code ook met grote embedded datasets, search index en virtualisatie werkt.  



\# 9. Nieuwe state-structuur



Ik zou `AppState` zo aanscherpen:



```js

AppState = {

&nbsp; activeTabId: ...,



&nbsp; selectedRowKeys: new Set(),

&nbsp; contextRowKey: null,

&nbsp; focusedRowKey: null,



&nbsp; tabs: {

&nbsp;   projects: {

&nbsp;     viewState: {

&nbsp;       selection: new Set(),

&nbsp;       ...

&nbsp;     }

&nbsp;   }

&nbsp; }

}

```



Dus expliciet:



\* `selectedRows` hernoemen naar `selectedRowKeys`

\* `contextRow` hernoemen naar `contextRowKey`



De huidige state beschrijft selectie en context al als aparte categorieën, dus dit is een natuurlijke aanscherping van de bestaande architectuur. 



\# 10. Identity API die overal verplicht gebruikt moet worden



Voeg een kleine maar harde identity-laag toe:



```js

function getPrimaryKeyField(tab) {}

function getRecordId(tab, row) {}

function getRowKey(tab, row) {}

function getRowRef(tab, row) {}

function getRecordByRowKey(rowKey) {}

function hasRowKey(tab, rowKey) {}

function validateRowIdentity(tab, data) {}

```



\## Gedrag



\* UI mag nooit direct `row.id` lezen

\* UI mag nooit direct `row.name` als identity gebruiken

\* event handlers krijgen `rowKey`

\* export werkt met `rowKey`

\* modal lookup werkt met `rowKey`



\# 11. Gebruik in rendering



Elke gerenderde rij moet een expliciete `data-row-key` krijgen:



```html

<tr data-row-key="projects::P-1042" ...>

```



En alle row-actions moeten daarop draaien:



\* click selectie

\* keyboard selectie

\* context menu

\* open modal

\* bulk acties



Zo maak je DOM en state consistent zonder afhankelijk te worden van render-volgorde.



\# 12. Gebruik in selectie



De huidige selectiebar en selectie-acties bestaan al, inclusief “Exporteer selectie” en `clearSelection()`. 



Nieuwe regels:



\## Selecteer 1 rij



```js

AppState.selectedRowKeys.add(rowKey)

```



\## Deselecteer 1 rij



```js

AppState.selectedRowKeys.delete(rowKey)

```



\## Select all



Niet alle data blind, maar:



\* of alle zichtbare leaf rows in de current resolved view

\* of alle filtered rows, afhankelijk van productkeuze



Cruciale regel:

\*\*select all moet rowKeys verzamelen uit de resolved dataset, nooit uit DOM-rijindexen.\*\*



Dus:



\* bij virtualisatie alleen zichtbare DOM tellen is fout

\* je moet uit de afgeleide view-data komen



Dat is belangrijk omdat de testset al controleert dat DOM-rijen minder mogen zijn dan data door virtual scroll.



\# 13. Gebruik in grouping



Bij grouping heb je twee entiteiten:



\* group headers

\* leaf rows



Alleen leaf rows krijgen row identity.



Dus in de flattened grouped list:



```js

\[

&nbsp; { type: 'group', path: 'Status=Actief' },

&nbsp; { type: 'row', rowKey: 'projects::P-1042', record: {...} }

]

```



Regels:



\* `collapsedGroups` bewaart group paths

\* `selectedRowKeys` bewaart alleen leaf rowKeys

\* group collapse mag nooit selection state muteren

\* group header checkbox, als die komt, moet leaf rowKeys aggregeren



De huidige code behandelt group collapse al apart van data/sort/filter recomputatie, dus identity moet daar volledig los van staan. 



\# 14. Gebruik in modal en contextmenu



Nu:



\* `showCtx(e,key)` bewaart `contextRow=key`

\* `expandRow()` parseert dat

\* `openModal(tab,id)` zoekt record met `x.id===id`

\* modal-title gebruikt `r.name||String(r.id)` 



Nieuw model:



```js

function showCtx(e, rowKey) {

&nbsp; e.preventDefault();

&nbsp; AppState.contextRowKey = rowKey;

&nbsp; AppState.selectedRowKeys.add(rowKey);

&nbsp; updateSelectionUI();

&nbsp; ...

}



function expandRow() {

&nbsp; if (!AppState.contextRowKey) return;

&nbsp; openModalByRowKey(AppState.contextRowKey);

}



function openModalByRowKey(rowKey) {

&nbsp; var rec = getRecordByRowKey(rowKey);

&nbsp; if (!rec) return;

&nbsp; ...

}

```



Voordelen:



\* geen string parsing op tab-index

\* geen numerieke aanname

\* geen afhankelijkheid van veldnaam `id`

\* modal kan direct semantische `detailTitle` gebruiken in plaats van `name` hardcoded



\# 15. Gebruik in export



Voor selectie-export moet de flow zijn:



```js

var selectedRecords = resolvedCurrentTabData.filter(function(row){

&nbsp; return AppState.selectedRowKeys.has(getRowKey(tab, row));

});

```



Nog beter:



\* gebruik de rowKey→record index

\* exporteer exact de records achter die sleutels



Regels:



\* export mag niet afhankelijk zijn van huidige DOM-window

\* export mag niet afhankelijk zijn van array-index

\* export moet eerst valideren dat alle selected keys nog bestaan

\* ontbrekende keys rapporteren als stale selection warning



Dat is extra relevant omdat er al selection export UI is en de engine meerdere exportpaden kent. 



\# 16. Detectie van stale selection



Er moet een controle komen bij elke data refresh of tab restore:



```js

function reconcileSelectionForTab(tabId) {

&nbsp; var validKeys = getAllRowKeysForTab(tabId);

&nbsp; var next = new Set();

&nbsp; AppState.selectedRowKeys.forEach(function(k){

&nbsp;   if (validKeys.has(k)) next.add(k);

&nbsp; });

&nbsp; AppState.selectedRowKeys = next;

}

```



Waarom:



\* data kan verversen

\* filters zijn niet hetzelfde als datawijzigingen

\* record kan echt verdwijnen of sleutel kan wijzigen

\* oude selectie mag niet stil naar een ander record “springen”



Regel:

\*\*als identity verdwijnt, vervalt selectie; hij mag nooit hergebruikt worden voor een ander record.\*\*



\# 17. Duplicate-key beleid



Dit is cruciaal.



Bij init van een tab:



```js

function validateUniquePrimaryKeys(tab, data) {

&nbsp; var seen = new Set();

&nbsp; var duplicates = \[];

&nbsp; data.forEach(function(row, idx){

&nbsp;   var key = getRowKey(tab, row);

&nbsp;   if (!key) duplicates.push({ idx: idx, reason: 'missing-key' });

&nbsp;   else if (seen.has(key)) duplicates.push({ idx: idx, rowKey: key, reason: 'duplicate' });

&nbsp;   else seen.add(key);

&nbsp; });

&nbsp; return duplicates;

}

```



Beleid:



\* duplicate of missing primary keys = \*\*tab fatal\*\* als multi-select/context/modal/exportSelection aan staan

\* anders minimaal zware warning + identity-afhankelijke features uit



Want bij duplicate keys is selectie semantisch onbetrouwbaar.



\# 18. Fallback als dataset nog geen goede primary key heeft



Soms heeft brondata nog geen echte sleutel. Dan zijn er twee opties.



\## Optie A — hard fail



Beste voor productie.



\## Optie B — tijdelijke engine key



Alleen voor development of demo.



Bij init:



```js

row.\_\_engineRowId = crypto.randomUUID()

```



Of deterministisch:



```js

row.\_\_engineRowId = hash(stableSubsetOfFields)

```



Maar let op:



\* random UUID is niet stabiel over reloads

\* hash over inhoud breekt als inhoud wijzigt

\* dus dit is \*\*geen echte business identity\*\*



Daarom:



\* alleen toegestaan in dev/demo

\* modal/context/selection mogen ermee werken

\* export met selectie moet expliciet melden dat identity tijdelijk is



\# 19. Consequenties voor tests



De huidige tests dekken selectiepersistentie, contextmenu en virtualisatie al deels.

Maar voor stabiele identity zou ik minimaal toevoegen:



\## ID-1 Primary key contract



\* ontbrekende primaryKey → fail

\* nullable primaryKey → fail

\* duplicate primaryKey → fail



\## ID-2 Selection persistence



\* selectie blijft op hetzelfde record na sorteren

\* selectie blijft op hetzelfde record na filteren

\* selectie blijft op hetzelfde record na grouping

\* selectie blijft op hetzelfde record na virtual scroll window shift



\## ID-3 Context / modal



\* contextmenu op rowKey A opent modal voor exact record A

\* string id’s werken

\* numerieke id’s werken

\* leading zero ids blijven intact



\## ID-4 Export integrity



\* selectie-export bevat exact selected rowKeys

\* volgorde van zichtbare tabel verandert selectie-inhoud niet

\* stale keys worden verwijderd of gemeld



\## ID-5 No index leakage



\* geen event handler gebruikt array-index als identity

\* geen modal lookup via zichtindex

\* geen parseInt op record ids



\# 20. Migratiepad vanaf huidige situatie



Ik zou dit in 5 stappen doen.



\## Stap 1 — primaryKey verplicht in contract



Per tab `schemaContract.primaryKey` invoeren.



\## Stap 2 — rowKey helpers invoeren



Nieuwe helpers maken, nog zonder alle oude code meteen te schrappen.



\## Stap 3 — contextmenu en modal omzetten



Dat is nu het duidelijkste identity-pad in de code en bevat al de meest zichtbare zwaktes (`split('-')`, `parseInt`, `x.id===id`). 



\## Stap 4 — selectie volledig op rowKey



`selectedRows` → `selectedRowKeys`

Alle checkboxen, Ctrl+A en selection export via rowKey.



\## Stap 5 — oude directe `row.id` toegang verbieden



Met lint/testregel:



\* enginecode mag `row.id` niet direct lezen buiten identity helpers

\* enginecode mag `parseInt(recordId)` niet gebruiken



\# 21. Concrete minimumimplementatie



Als je dit pragmatisch wilt doen zonder hele engine meteen te herschrijven, dan is dit de kleinste verstandige set:



```js

function getTabConfigById(tabId) {}

function getPrimaryKeyField(tabId) {}

function normalizeRecordId(v) {}

function makeRowKey(tabId, recordId) {}

function getRowKeyForRecord(tabId, row) {}

function buildRowIndex(tabId, rows) {}

function getRecordByRowKey(rowKey) {}

```



Daarnaast:



\* `AppState.selectedRows` hernoemen naar `selectedRowKeys`

\* `AppState.contextRow` hernoemen naar `contextRowKey`

\* alle `<tr>` krijgen `data-row-key`

\* `openModalByRowKey()` invoeren

\* duplicate-key validatie bij init



\# 22. Beslisregel



De belangrijkste ontwerpregel in één zin:



\*\*De engine mag een record alleen nog benaderen via een contractgedreven row identity, nooit via positie, parsebare view-state of impliciete veldnamen.\*\*



Dat is de enige manier waarop selectie, contextmenu, modal, export en virtualisatie betrouwbaar samen kunnen blijven werken in deze architectuur met per-tab view state, grouping en virtual scroll.    



Ik kan dit hierna ook uitwerken naar een \*\*implementatieplan met functies en codepatches voor `dashboard.html`\*\*, of naar een \*\*review.md-sectie “Stable Row Identity” met severity, acceptance criteria en tests\*\*.



