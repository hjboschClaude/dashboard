Hier is een volledige uitwerking van \*\*Schema-contract + feature gating\*\* voor deze dashboard-engine.



De kernreden hiervoor zit al in het bestand zelf: Layer 2 wil generiek zijn, maar erkent nog hardcoded veldnamen in onder meer `applyFiltersToData()`, `condClass()`, `rowHtml()` en de modal. Tegelijk verwacht de architectuur dat Layer 4 dashboard-specs AI-gegenereerd kunnen worden en dat Layer 3 datasets schema-validated worden aangeleverd. Zonder expliciet contract tussen data, semantiek en features ontstaat precies het risico dat een dashboard technisch rendert maar inhoudelijk verkeerde logica toepast.



\# 1. Doel



Het schema-contract moet drie dingen afdwingen:



1\. \*\*Data-contract\*\*

   Welke velden bestaan er, welk type hebben ze, en zijn ze nullable?



2\. \*\*Semantisch contract\*\*

   Welke velden spelen een functionele rol in de engine, bijvoorbeeld:



   \* primaire labeltekst

   \* stabiele rij-id

   \* zoekbare naam/omschrijving

   \* status

   \* prioriteit

   \* voortgang

   \* actief/inactief

   \* eigenaar/verantwoordelijke



3\. \*\*Feature contract\*\*

   Welke features mogen alleen aan als de noodzakelijke semantiek aanwezig is?



Dat sluit direct aan op de bestaande contracts in het bestand, maar maakt ze een stuk strenger en bruikbaarder voor runtime-beslissingen. Het huidige bestand heeft al `validateDatasetContract()` en documenteert ook een `dashboardSpecContract`, maar die zijn nog vooral structuurgericht en nog niet sterk genoeg om feature-semantiek af te dwingen.



\# 2. Het probleem dat dit oplost



Nu bestaat het risico dat een tab er geldig uitziet omdat:



\* `tabs\\\[]` bestaat,

\* `columns\\\[]` bestaat,

\* records arrays bevatten,



maar dat:



\* de naamfilter in werkelijkheid op een niet-bestaand veld zoekt,

\* conditional formatting op verkeerde velden draait,

\* de modal een lege titel toont,

\* row aria-labels betekenisloos zijn,

\* sorteren, groeperen en export wel werken, maar semantisch niet doen wat de gebruiker denkt.



Dus: \*\*structuurvalidatie alleen is niet genoeg\*\*. Er is ook semantische validatie nodig.



\# 3. Ontwerpprincipe



De engine moet geen impliciete kennis meer hebben zoals:



\* “tab 0 gebruikt `directeur`, `aog`, `pm`”

\* “tab 1 gebruikt `name`”

\* “conditional formatting kijkt naar `priority`, `status`, `progress`”

\* “modal gebruikt `name` en `id`”



In plaats daarvan moet elke tab expliciet verklaren:



\* welke velden er zijn,

\* welke semantische rol elk relevant veld speelt,

\* welke features afhankelijk zijn van welke rollen.



\# 4. Nieuwe contractlagen



\## 4.1 Dataset contract



Uitbreiding op het bestaande `validateDatasetContract()`:



```js

dataset = {

\&nbsp; records: \\\[...],

\&nbsp; schema: {

\&nbsp;   fields: \\\[

\&nbsp;     {

\&nbsp;       name: "projectNaam",

\&nbsp;       type: "text",           // text|number|date|boolean|enum

\&nbsp;       nullable: false,

\&nbsp;       unique: false,

\&nbsp;       enumValues: null

\&nbsp;     },

\&nbsp;     {

\&nbsp;       name: "status",

\&nbsp;       type: "enum",

\&nbsp;       nullable: false,

\&nbsp;       enumValues: \\\["Actief","In Review","On Hold","Voltooid"]

\&nbsp;     },

\&nbsp;     {

\&nbsp;       name: "progress",

\&nbsp;       type: "number",

\&nbsp;       nullable: true,

\&nbsp;       min: 0,

\&nbsp;       max: 100

\&nbsp;     }

\&nbsp;   ],

\&nbsp;   primaryKey: "projectId"

\&nbsp; },

\&nbsp; sourceMeta: {

\&nbsp;   filename: "projecten.csv",

\&nbsp;   rowCount: 4521,

\&nbsp;   parseWarnings: \\\[]

\&nbsp; }

}

```



\## 4.2 Tab schema contract



Per tab in `dashboardSpec.tabs\\\[]` komt een nieuw blok:



```js

tab.schemaContract = {

\&nbsp; primaryKey: "projectId",

\&nbsp; semanticFields: {

\&nbsp;   primaryLabel: "projectNaam",

\&nbsp;   secondaryLabel: "programma",

\&nbsp;   owner: "pm",

\&nbsp;   status: "status",

\&nbsp;   priority: "priority",

\&nbsp;   progress: "progress",

\&nbsp;   activeFlag: "actief",

\&nbsp;   detailTitle: "projectNaam",

\&nbsp;   searchTextFields: \\\["projectNaam", "directeur", "aog", "pm"]

\&nbsp; }

}

```



\## 4.3 Feature requirements contract



Per feature een vaste declaratieve mapping:



```js

const FEATURE\\\_REQUIREMENTS = {

\&nbsp; search: {

\&nbsp;   anyOf: \\\[

\&nbsp;     { semantic: "searchTextFields" },

\&nbsp;     { semantic: "primaryLabel" }

\&nbsp;   ]

\&nbsp; },

\&nbsp; filter: {

\&nbsp;   requires: \\\[]

\&nbsp; },

\&nbsp; sort: {

\&nbsp;   requires: \\\[]

\&nbsp; },

\&nbsp; group: {

\&nbsp;   requires: \\\[]

\&nbsp; },

\&nbsp; condFormatting: {

\&nbsp;   anyOf: \\\[

\&nbsp;     { semanticSet: \\\["status"] },

\&nbsp;     { semanticSet: \\\["priority"] },

\&nbsp;     { semanticSet: \\\["progress"] },

\&nbsp;     { customResolver: "condFormattingRule" }

\&nbsp;   ]

\&nbsp; },

\&nbsp; multiSelect: {

\&nbsp;   requires: \\\["primaryKey"]

\&nbsp; },

\&nbsp; contextMenu: {

\&nbsp;   requires: \\\["primaryKey"]

\&nbsp; },

\&nbsp; modal: {

\&nbsp;   requires: \\\["detailTitle", "primaryKey"]

\&nbsp; },

\&nbsp; rowAria: {

\&nbsp;   requires: \\\["primaryLabel"]

\&nbsp; },

\&nbsp; exportSelection: {

\&nbsp;   requires: \\\["primaryKey"]

\&nbsp; }

};

```



\# 5. Nieuwe configuratiestructuur



Ik raad aan `dashboardConfig.tabs\\\[]` uit te breiden met drie nieuwe blokken:



```js

{

\&nbsp; id: "projects",

\&nbsp; label: "Projecten",

\&nbsp; dataSource: { type: "dataset" },



\&nbsp; columns: \\\[

\&nbsp;   { key: "projectId", label: "ID", type: "text", renderer: "text" },

\&nbsp;   { key: "projectNaam", label: "Project", type: "text", renderer: "text" },

\&nbsp;   { key: "status", label: "Status", type: "enum", renderer: "tag" },

\&nbsp;   { key: "priority", label: "Prioriteit", type: "enum", renderer: "tag" },

\&nbsp;   { key: "progress", label: "Voortgang", type: "number", renderer: "progress" },

\&nbsp;   { key: "pm", label: "Projectmanager", type: "text", renderer: "text" },

\&nbsp;   { key: "actief", label: "Actief", type: "boolean", renderer: "boolean" }

\&nbsp; ],



\&nbsp; schemaContract: {

\&nbsp;   primaryKey: "projectId",

\&nbsp;   semanticFields: {

\&nbsp;     primaryLabel: "projectNaam",

\&nbsp;     owner: "pm",

\&nbsp;     status: "status",

\&nbsp;     priority: "priority",

\&nbsp;     progress: "progress",

\&nbsp;     activeFlag: "actief",

\&nbsp;     detailTitle: "projectNaam",

\&nbsp;     searchTextFields: \\\["projectNaam", "pm", "directeur", "aog"]

\&nbsp;   }

\&nbsp; },



\&nbsp; featurePolicies: {

\&nbsp;   onContractError: "disable",      // disable | fail-tab | fail-app | warn-only

\&nbsp;   onTypeMismatch: "disable",

\&nbsp;   onMissingSemantic: "disable",

\&nbsp;   showUserWarnings: true

\&nbsp; },



\&nbsp; features: {

\&nbsp;   search: true,

\&nbsp;   filter: true,

\&nbsp;   sort: true,

\&nbsp;   group: true,

\&nbsp;   condFormatting: true,

\&nbsp;   freeze: true,

\&nbsp;   multiSelect: true,

\&nbsp;   contextMenu: true,

\&nbsp;   modal: true

\&nbsp; },



\&nbsp; exports: {

\&nbsp;   allow: \\\["csv","json","xlsx","html","markdown","png"],

\&nbsp;   defaultScope: "filtered",

\&nbsp;   allowSelectionExport: true

\&nbsp; }

}

```



\# 6. Validatiestappen bij opstart



De bestaande opstartsequentie noemt al `\\\_validateContractsOnInit()` vóór `initTabDataFromConfig()` en render. Dat is precies de juiste plek om dit veel zwaarder te maken.



Nieuwe flow:



\## Stap A — validateDashboardSpecStructure



Controleer:



\* `tabs\\\[]` bestaat

\* `columns\\\[]` bestaat

\* elke kolom heeft `key`, `label`, `type`, `renderer`

\* tab ids uniek

\* `features`, `exports`, `defaults` hebben geldige vorm



Dit borduurt voort op het bestaande `dashboardSpecContract`.



\## Stap B — validateDatasetStructure



Controleer:



\* `records` array

\* `schema.fields\\\[]` geldig

\* `primaryKey` bestaat in schema

\* veldnamen uniek

\* types geldig

\* bij enum: enumValues aanwezig



\## Stap C — validateSchemaAlignment



Controleer per tab:



\* elke `columns\\\[].key` bestaat in dataset schema

\* elk semantic field verwijst naar bestaand schema field

\* `searchTextFields\\\[]` bevat alleen bestaande velden

\* `primaryKey` bestaat echt in records



\## Stap D — validateTypeSemantics



Controleer:



\* `progress` moet `number` zijn

\* `activeFlag` moet `boolean` zijn

\* `status` en `priority` moeten meestal `enum` of `text` zijn

\* `primaryLabel` moet `text` of `enum` zijn

\* `primaryKey` mag niet nullable zijn



\## Stap E — validateFeatureRequirements



Controleer per ingeschakelde feature of de vereiste semantiek aanwezig is.



\## Stap F — runtime feature resolution



Bepaal uiteindelijke actieve feature-set:



```js

resolvedFeatures = {

\&nbsp; search: true,

\&nbsp; filter: true,

\&nbsp; sort: true,

\&nbsp; group: true,

\&nbsp; condFormatting: false,   // uitgeschakeld wegens ontbrekend progress/status/priority contract

\&nbsp; multiSelect: true,

\&nbsp; contextMenu: true,

\&nbsp; modal: false             // uitgeschakeld wegens ontbrekende detailTitle

}

```



\# 7. Hard fail versus soft fail



Niet elke contractfout moet het hele dashboard stoppen.



Ik raad deze indeling aan.



\## Niveau 1 — App fatal



Stop hele app bij:



\* geen tabs

\* dubbele tab ids

\* corrupte `dashboardConfig`

\* dataset niet leesbaar

\* `columns\\\[]` ontbreekt volledig

\* `primaryKey` ontbreekt én multiSelect/context-menu/exportSelection zijn verplicht op appniveau



\## Niveau 2 — Tab fatal



Blokkeer alleen deze tab bij:



\* kolommen verwijzen naar niet-bestaande velden

\* primaryKey ontbreekt

\* recordset is geen array

\* schema en records lopen fundamenteel uiteen



Tab wordt dan zichtbaar als disabled met duidelijke melding.



\## Niveau 3 — Feature degrade



Schakel alleen feature uit bij:



\* search zonder searchvelden

\* condFormatting zonder status/prioriteit/progress

\* modal zonder detailTitle

\* selection export zonder primaryKey



\## Niveau 4 — Warning only



Alleen waarschuwing bij:



\* nullable progress

\* missing enumValues

\* searchTextFields deels leeg

\* owner ontbreekt, terwijl alleen displayfunctionaliteit dat raakt



\# 8. Feature gating matrix



Dit is het hart van het ontwerp.



\## 8.1 Zoekfunctie



\*\*Benodigd\*\*



\* `searchTextFields\\\[]` of minimaal `primaryLabel`



\*\*Enginegedrag\*\*



\* zoekindex wordt alleen gebouwd op die velden

\* geen hardcoded `r.directeur/aog/pm` of `r.name` meer



\*\*Bij ontbreken\*\*



\* zoekbalk verbergen of disabled tonen

\* warning loggen



\## 8.2 Conditional formatting



Nu leunt dit nog op `priority`, `status`, `progress`, wat ook in tests zichtbaar is.



\*\*Benodigd\*\*



\* ofwel semantische velden `status`, `priority`, `progress`

\* ofwel custom declaratieve rule config



Nieuwe configuratie:



```js

condFormatting: {

\&nbsp; enabled: true,

\&nbsp; rules: \\\[

\&nbsp;   { when: { semantic: "priority", op: "equals", value: "Hoog" }, className: "cond-red" },

\&nbsp;   { when: { semantic: "status", op: "equals", value: "On Hold" }, className: "cond-red" },

\&nbsp;   { when: { semantic: "status", op: "equals", value: "Voltooid" }, className: "cond-green" },

\&nbsp;   { when: { semantic: "progress", op: "lt", value: 30 }, className: "cond-yellow" }

\&nbsp; ]

}

```



\*\*Bij ontbreken\*\*



\* `condFormatting` uit

\* geen impliciete fallback



\## 8.3 Modal / detailpanel



Nu gebruikt de code nog `r.name` en `r.id`.



\*\*Benodigd\*\*



\* `primaryKey`

\* `detailTitle`



\*\*Optioneel\*\*



\* `secondaryLabel`

\* `owner`

\* `status`



\*\*Bij ontbreken\*\*



\* detail modal uit

\* rijklik kan alleen selecteren



\## 8.4 Multi-select



\*\*Benodigd\*\*



\* `primaryKey`

\* primaryKey uniek en niet-null



\*\*Bij ontbreken\*\*



\* multiSelect uit

\* selection export uit



\## 8.5 Contextmenu



\*\*Benodigd\*\*



\* `primaryKey`



\*\*Waarom\*\*

Acties moeten aan stabiele identiteit hangen, niet aan zichtindex.



\## 8.6 Row aria-label



Nu nog afhankelijk van `r.name`.



\*\*Benodigd\*\*



\* `primaryLabel`



\*\*Bij ontbreken\*\*



\* generiek fallback label: `Rij 12`

\* warning loggen



\## 8.7 Export van selectie



\*\*Benodigd\*\*



\* `primaryKey`

\* resolvedSelectionIds



\*\*Bij ontbreken\*\*



\* alleen export van current filtered dataset

\* geen selectie-optie in UI



\# 9. Declaratieve semantiek in plaats van hardcoded veldnamen



De grootste winst zit hier.



In plaats van dit soort logica:



```js

if (activeTab === 0) {

\&nbsp; haystack = \\\[r.directeur, r.aog, r.pm].join(' ');

} else {

\&nbsp; haystack = r.name || '';

}

```



wordt het:



```js

function getSemanticField(tab, semanticName) {

\&nbsp; return tab.schemaContract \\\&\\\&

\&nbsp;        tab.schemaContract.semanticFields \\\&\\\&

\&nbsp;        tab.schemaContract.semanticFields\\\[semanticName] || null;

}



function getSemanticValue(tab, row, semanticName) {

\&nbsp; var field = getSemanticField(tab, semanticName);

\&nbsp; return field ? row\\\[field] : null;

}



function getSearchText(tab, row) {

\&nbsp; var sf = tab.schemaContract?.semanticFields?.searchTextFields || \\\[];

\&nbsp; if (!sf.length) {

\&nbsp;   var primary = getSemanticField(tab, 'primaryLabel');

\&nbsp;   return primary ? String(row\\\[primary] || '') : '';

\&nbsp; }

\&nbsp; return sf.map(function(f){ return row\\\[f] == null ? '' : String(row\\\[f]); }).join(' ');

}

```



Hiermee verdwijnt de tab-specifieke if/else-logica uit de engine.



\# 10. Type-validatie per semantische rol



Ik raad een expliciete semantische typekaart aan:



```js

const SEMANTIC\\\_ROLE\\\_RULES = {

\&nbsp; primaryKey:    { allowedTypes: \\\["text","number"], nullable: false, unique: true },

\&nbsp; primaryLabel:  { allowedTypes: \\\["text","enum"], nullable: false },

\&nbsp; secondaryLabel:{ allowedTypes: \\\["text","enum"], nullable: true },

\&nbsp; owner:         { allowedTypes: \\\["text","enum"], nullable: true },

\&nbsp; status:        { allowedTypes: \\\["enum","text"], nullable: true },

\&nbsp; priority:      { allowedTypes: \\\["enum","text"], nullable: true },

\&nbsp; progress:      { allowedTypes: \\\["number"], nullable: true, range:\\\[0,100] },

\&nbsp; activeFlag:    { allowedTypes: \\\["boolean"], nullable: true },

\&nbsp; detailTitle:   { allowedTypes: \\\["text","enum"], nullable: false },

\&nbsp; searchTextFields: { allowedTypes: \\\["text","enum"], array: true }

};

```



Daarmee kun je niet alleen bestaan controleren, maar ook of een mapping logisch is.



\# 11. Runtime API die ik zou toevoegen



\## 11.1 Contract resolver



```js

function resolveTabContract(tab, dataset) {

\&nbsp; return {

\&nbsp;   tabId: tab.id,

\&nbsp;   valid: true,

\&nbsp;   errors: \\\[],

\&nbsp;   warnings: \\\[],

\&nbsp;   semantics: {},

\&nbsp;   resolvedFeatures: {},

\&nbsp;   schemaByField: {},

\&nbsp;   fieldBySemantic: {}

\&nbsp; };

}

```



\## 11.2 Feature gate evaluator



```js

function evaluateFeatureGates(tab, contractResult) {

\&nbsp; var out = {};

\&nbsp; Object.keys(tab.features || {}).forEach(function(featureName) {

\&nbsp;   out\\\[featureName] = isFeatureAllowed(featureName, tab, contractResult);

\&nbsp; });

\&nbsp; return out;

}

```



\## 11.3 Guard helpers



```js

function hasSemantic(tabIdx, semanticName) {}

function getSemantic(tabIdx, semanticName) {}

function isFeatureEnabled(tabIdx, featureName) {}

function requireFeature(tabIdx, featureName, fallbackFn) {}

```



\# 12. UI-gedrag bij contractproblemen



De gebruiker moet contractproblemen niet alleen in console zien.



\## 12.1 Tab badge



Toon bij tabtitel:



\* groen: OK

\* oranje: degraded

\* rood: blocked



\## 12.2 Diagnostics panel



Per tab:



\* contractstatus

\* ontbrekende semantic fields

\* uitgeschakelde features

\* type mismatches

\* parse warnings uit Layer 3



\## 12.3 Feature tooltips



Bij uitgeschakelde knop:



\* “Zoeken niet beschikbaar: geen searchTextFields geconfigureerd”

\* “Conditional formatting uitgeschakeld: geen status/prioriteit/progress semantiek”



\## 12.4 Dev versus productie



\* development: detailniveau hoog, console + diagnostics

\* production: nette gebruikersmelding, compacte diagnostiek



\# 13. Voorbeeld van degrade-uitkomst



Stel tab “Teamleden” heeft:



```js

semanticFields: {

\&nbsp; primaryKey: "medewerkerId",

\&nbsp; primaryLabel: "naam",

\&nbsp; owner: "leidinggevende"

}

```



Maar geen `status`, `priority`, `progress`, `detailTitle`.



Dan wordt resultaat:



```js

{

\&nbsp; valid: true,

\&nbsp; warnings: \\\[

\&nbsp;   "semantic status ontbreekt",

\&nbsp;   "semantic priority ontbreekt",

\&nbsp;   "semantic progress ontbreekt",

\&nbsp;   "semantic detailTitle ontbreekt"

\&nbsp; ],

\&nbsp; resolvedFeatures: {

\&nbsp;   search: true,

\&nbsp;   filter: true,

\&nbsp;   sort: true,

\&nbsp;   group: true,

\&nbsp;   condFormatting: false,

\&nbsp;   freeze: true,

\&nbsp;   multiSelect: true,

\&nbsp;   contextMenu: true,

\&nbsp;   modal: false

\&nbsp; }

}

```



Dus tab werkt grotendeels, maar alleen relevante features blijven actief.



\# 14. Migratiepad voor jullie huidige code



Ik zou dit in 4 fasen doen.



\## Fase 1 — Contractlaag toevoegen zonder gedrag te wijzigen



\* voeg `schemaContract` toe aan tabs

\* voeg validator toe

\* log alleen warnings

\* laat huidige hardcoded logica nog bestaan



Doel: zichtbaar maken wat ontbreekt.



\## Fase 2 — Dual mode



\* engine probeert eerst semantische mappings

\* valt tijdelijk terug op legacy hardcoded veldnamen

\* logt elke fallback als tech debt



Bijvoorbeeld:



\* `globalNameFilter` gebruikt eerst `searchTextFields`, anders legacy pad

\* `condClass` gebruikt eerst declaratieve rules, anders legacy `priority/status/progress`



\## Fase 3 — Feature gating aanzetten



\* ontbrekende semantiek schakelt features echt uit

\* diagnostics zichtbaar

\* legacy fallback alleen nog in development



\## Fase 4 — Legacy verwijderen



\* geen enginecode meer met `r.name`, `r.id`, `r.directeur`, `r.aog`, `r.pm`, `r.priority`, `r.status`, `r.progress`, `r.actief`

\* alles via semantic accessors



Dat is precies de stap die het bestand zelf al als tech debt markeert richting config extraction.



\# 15. Teststrategie



De bestaande testset bevat al checks voor `condClass`, sorting, grouping en contracts, maar nog vooral in de huidige hardcoded semantiek.



Voeg minimaal deze suites toe.



\## 15.1 CONTRACT-STRUCT



\* tab zonder `columns`

\* duplicate tab ids

\* column zonder key

\* schema zonder fields

\* dataset zonder records



\## 15.2 CONTRACT-ALIGN



\* column key niet in schema

\* semantic field verwijst naar onbekend veld

\* primaryKey niet in schema

\* searchTextFields bevat onbekend veld



\## 15.3 CONTRACT-TYPE



\* progress als text

\* activeFlag als enum

\* primaryKey nullable

\* primaryLabel als boolean



\## 15.4 FEATURE-GATE



\* condFormatting aangevraagd maar geen status/prioriteit/progress

\* modal aangevraagd zonder detailTitle

\* multiSelect zonder primaryKey

\* search zonder searchvelden



\## 15.5 DEGRADE-BEHAVIOR



\* featureknoppen disabled zichtbaar

\* diagnostics toont juiste reden

\* render blijft werken ondanks gedegradeerde feature



\## 15.6 LEGACY-ELIMINATION



\* geen enginefunctie leest direct `row.name`

\* geen enginefunctie leest direct `row.id`

\* geen enginefunctie bevat tab-index-specifieke zoeklogica



\# 16. Concrete validatiefuncties



Ik zou minimaal deze functies toevoegen:



```js

function validateDashboardSpecStructure(spec) {}

function validateDatasetStructure(dataset) {}

function validateTabSchemaAlignment(tab, dataset) {}

function validateSemanticRoles(tab, dataset) {}

function validateFeatureRequirements(tab, contractResult) {}

function resolveTabContracts(spec, datasetPayload) {}

```



En als output:



```js

window.ContractRegistry = {

\&nbsp; byTabId: {

\&nbsp;   projects: {

\&nbsp;     valid: true,

\&nbsp;     errors: \\\[],

\&nbsp;     warnings: \\\[],

\&nbsp;     resolvedFeatures: {...},

\&nbsp;     semanticFields: {...},

\&nbsp;     schema: {...}

\&nbsp;   }

\&nbsp; },

\&nbsp; appValid: true,

\&nbsp; appErrors: \\\[]

};

```



\# 17. Voorbeeld van pseudocode



```js

function resolveTabContract(tab, dataset) {

\&nbsp; var result = {

\&nbsp;   valid: true,

\&nbsp;   errors: \\\[],

\&nbsp;   warnings: \\\[],

\&nbsp;   resolvedFeatures: {},

\&nbsp;   semanticFields: {},

\&nbsp;   schemaFields: {}

\&nbsp; };



\&nbsp; var fields = (dataset.schema \\\&\\\& dataset.schema.fields) || \\\[];

\&nbsp; var fieldMap = {};

\&nbsp; fields.forEach(function(f){ fieldMap\\\[f.name] = f; });

\&nbsp; result.schemaFields = fieldMap;



\&nbsp; var semantics = (tab.schemaContract \\\&\\\& tab.schemaContract.semanticFields) || {};

\&nbsp; result.semanticFields = semantics;



\&nbsp; var pk = tab.schemaContract \\\&\\\& tab.schemaContract.primaryKey;

\&nbsp; if (!pk) result.errors.push('primaryKey ontbreekt');

\&nbsp; else if (!fieldMap\\\[pk]) result.errors.push('primaryKey verwijst naar onbekend veld: ' + pk);

\&nbsp; else {

\&nbsp;   var pkField = fieldMap\\\[pk];

\&nbsp;   if (pkField.nullable) result.errors.push('primaryKey mag niet nullable zijn');

\&nbsp;   if (\\\['text','number'].indexOf(pkField.type) === -1) {

\&nbsp;     result.errors.push('primaryKey moet text of number zijn');

\&nbsp;   }

\&nbsp; }



\&nbsp; Object.keys(semantics).forEach(function(role){

\&nbsp;   var value = semantics\\\[role];

\&nbsp;   if (Array.isArray(value)) {

\&nbsp;     value.forEach(function(fieldName){

\&nbsp;       if (!fieldMap\\\[fieldName]) result.errors.push(role + ' verwijst naar onbekend veld: ' + fieldName);

\&nbsp;     });

\&nbsp;   } else {

\&nbsp;     if (!fieldMap\\\[value]) result.errors.push(role + ' verwijst naar onbekend veld: ' + value);

\&nbsp;   }

\&nbsp; });



\&nbsp; Object.keys(tab.features || {}).forEach(function(featureName){

\&nbsp;   if (!tab.features\\\[featureName]) {

\&nbsp;     result.resolvedFeatures\\\[featureName] = false;

\&nbsp;     return;

\&nbsp;   }

\&nbsp;   result.resolvedFeatures\\\[featureName] =

\&nbsp;     evaluateSingleFeatureGate(featureName, tab, fieldMap, semantics, result);

\&nbsp; });



\&nbsp; if (result.errors.length) result.valid = false;

\&nbsp; return result;

}

```



\# 18. Mijn aanbevolen minimumversie



Als je dit pragmatisch wilt invoeren zonder meteen alles te verbouwen, dan is dit het minimum dat ik zou eisen:



Per tab verplicht:



\* `schemaContract.primaryKey`

\* `schemaContract.semanticFields.primaryLabel`

\* `schemaContract.semanticFields.searchTextFields`

\* `schemaContract.semanticFields.detailTitle` als modal aan staat

\* `schemaContract.semanticFields.status/priority/progress` of declaratieve cond rules als condFormatting aan staat



En qua gating:



\* search uit zonder `searchTextFields`

\* multiSelect/contextMenu/exportSelection uit zonder `primaryKey`

\* modal uit zonder `detailTitle`

\* condFormatting uit zonder vereiste semantiek



Dat pakt direct de grootste risico’s aan die nu uit het bestand zelf blijken.



\# 19. Eindoordeel



De juiste ontwerpregel is:



\*\*geen enkele feature mag afhankelijk zijn van impliciete veldnamen; elke feature moet expliciet gekoppeld zijn aan semantische rollen en alleen actief zijn als dat contract valide is.\*\*



Daarmee verandert de engine van:



\* “generiek qua structuur maar deels hardcoded qua betekenis”



naar:



\* “echt generiek, contractgedreven en veilig te assembleren met Layer 3 datasets en Layer 4 AI-specs”.



Ik kan dit hierna ook omzetten naar een \*\*concreet technisch ontwerp in Markdown\*\*, of meteen naar \*\*implementatieklare JavaScript code voor `validateContractsOnInit()` + `resolveFeatureGates()`\*\*.



