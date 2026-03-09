/**
 * CSV Adapter — Layer 3: CSV → datasetContract
 *
 * Versie:   0.62.0
 * Positie:  src/csv-adapter/csv-adapter.js
 * Doel:     Transformeert ruwe CSV-tekst naar een gevalideerd datasetContract
 *           dat de Layer 2 engine direct kan consumeren.
 *
 * Geen DOM-afhankelijkheden. Geen engine-afhankelijkheden.
 * Puur functionele data-transformatie.
 *
 * Publieke API:
 *   CsvAdapter.parseCSV(csvText, options?) → { records, schema, sourceMeta }
 *
 * Pipeline: parsing → header normalisatie → type inferentie →
 *           waarde-conversie → schema generatie → validatie & output
 */
(function(global) {
  'use strict';

  var VERSION = '0.62.0';

  // ══════════════════════════════════════════════════════════════
  // ── STAP 1: PARSING ─────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════

  /**
   * Strip UTF-8 BOM (Byte Order Mark) van begin van string.
   * @param {string} text
   * @returns {string}
   */
  function removeBOM(text) {
    if (text && text.charCodeAt(0) === 0xFEFF) return text.slice(1);
    return text || '';
  }

  /**
   * Auto-detect CSV delimiter door eerste regels te scannen.
   * NL-prioriteit bij gelijkspel: ; > , > \t
   * @param {string} csvText
   * @returns {string} ';' | ',' | '\t'
   */
  function detectDelimiter(csvText) {
    var candidates = [';', ',', '\t'];
    var lines = csvText.split(/\r?\n/).slice(0, 5).filter(function(l) { return l.trim().length > 0; });
    if (lines.length === 0) return ';';

    var scores = {};
    candidates.forEach(function(d) { scores[d] = 0; });

    // Tel occurrences per regel, kies meest consistente
    var counts = {};
    candidates.forEach(function(d) {
      counts[d] = lines.map(function(line) {
        // Tel delimiter buiten quotes
        var count = 0;
        var inQuote = false;
        for (var i = 0; i < line.length; i++) {
          if (line[i] === '"') inQuote = !inQuote;
          else if (!inQuote && line[i] === d) count++;
        }
        return count;
      });
    });

    // Kies delimiter met hoogste consistente count (alle regels zelfde count, count > 0)
    var best = ';';
    var bestScore = -1;

    candidates.forEach(function(d) {
      var c = counts[d];
      var min = Math.min.apply(null, c);
      var max = Math.max.apply(null, c);
      // Consistentie: verschil tussen min en max klein, en min > 0
      if (min > 0) {
        var score = min * 1000 - (max - min); // hoog min, lage variatie
        if (score > bestScore) {
          bestScore = score;
          best = d;
        }
      }
    });

    return best;
  }

  /**
   * Parse CSV-tekst naar 2D string array.
   * RFC 4180 compliant: quoted fields, embedded delimiters, embedded newlines.
   * @param {string} csvText
   * @param {string} delimiter
   * @returns {string[][]}
   */
  function tokenizeCSV(csvText, delimiter) {
    var rows = [];
    var row = [];
    var field = '';
    var inQuote = false;
    var i = 0;
    var len = csvText.length;

    while (i < len) {
      var ch = csvText[i];

      if (inQuote) {
        if (ch === '"') {
          // Kijk vooruit: dubbele quote = escaped quote
          if (i + 1 < len && csvText[i + 1] === '"') {
            field += '"';
            i += 2;
          } else {
            // Einde quote
            inQuote = false;
            i++;
          }
        } else {
          field += ch;
          i++;
        }
      } else {
        if (ch === '"') {
          inQuote = true;
          i++;
        } else if (ch === delimiter) {
          row.push(field);
          field = '';
          i++;
        } else if (ch === '\r') {
          // CR: overslaan als gevolgd door LF, anders als rij-einde
          if (i + 1 < len && csvText[i + 1] === '\n') {
            row.push(field);
            field = '';
            rows.push(row);
            row = [];
            i += 2;
          } else {
            row.push(field);
            field = '';
            rows.push(row);
            row = [];
            i++;
          }
        } else if (ch === '\n') {
          row.push(field);
          field = '';
          rows.push(row);
          row = [];
          i++;
        } else {
          field += ch;
          i++;
        }
      }
    }

    // Laatste veld/rij toevoegen
    if (field.length > 0 || row.length > 0) {
      row.push(field);
      rows.push(row);
    }

    // Strip trailing lege rijen
    while (rows.length > 1) {
      var last = rows[rows.length - 1];
      if (last.length === 1 && last[0].trim() === '') {
        rows.pop();
      } else if (last.length === 0) {
        rows.pop();
      } else {
        break;
      }
    }

    return rows;
  }

  // ══════════════════════════════════════════════════════════════
  // ── STAP 2: HEADER NORMALISATIE ─────────────────────────────
  // ══════════════════════════════════════════════════════════════

  /**
   * Converteer string naar camelCase.
   * "Kosten Realisatie" → "kostenRealisatie"
   * "in_dienst" → "inDienst"
   * "PROJECT-TYPE" → "projectType"
   * @param {string} str
   * @returns {string}
   */
  function toCamelCase(str) {
    if (!str) return '';
    str = str.trim();
    if (!str) return '';

    // Split op niet-alfanumerieke tekens
    var parts = str.split(/[^a-zA-Z0-9\u00C0-\u024F]+/).filter(function(p) { return p.length > 0; });
    if (parts.length === 0) return '';

    return parts.map(function(part, idx) {
      var lower = part.toLowerCase();
      if (idx === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }).join('');
  }

  /**
   * Normaliseer header-rij: camelCase, deduplicatie, lege headers.
   * @param {string[]} headerRow
   * @returns {string[]}
   */
  function normalizeHeaders(headerRow) {
    var seen = {};
    return headerRow.map(function(h, idx) {
      var key = toCamelCase(h);
      if (!key) key = 'column' + (idx + 1);

      if (seen[key]) {
        seen[key]++;
        key = key + seen[key];
      } else {
        seen[key] = 1;
      }
      return key;
    });
  }

  // ══════════════════════════════════════════════════════════════
  // ── STAP 3: TYPE INFERENTIE ─────────────────────────────────
  // ══════════════════════════════════════════════════════════════

  /**
   * Check of een string-waarde als null beschouwd moet worden.
   * @param {*} str
   * @returns {boolean}
   */
  function isNullValue(str) {
    if (str === null || str === undefined) return true;
    if (typeof str !== 'string') return false;
    var v = str.trim();
    if (v === '') return true;
    var lower = v.toLowerCase();
    return lower === 'null' || lower === 'n/a' || lower === 'n.v.t.' ||
           lower === '#n/a' || lower === '#n/b' || v === '-';
  }

  /** @internal */
  function isNumberLike(str) {
    var v = str.trim();
    if (!v) return false;
    // Strip currency prefixes/suffixes
    v = v.replace(/^[\s]*(?:EUR|€|USD|\$)[\s]*/i, '').replace(/[\s]*(?:EUR|€|USD|\$)[\s]*$/i, '');
    // Strip percentage
    v = v.replace(/%\s*$/, '');
    if (!v) return false;
    // NL format: 1.234.567,89 (punt=duizend, komma=decimaal)
    // EN format: 1,234,567.89
    // Detecteer: als er een komma is gevolgd door precies 2-3 cijfers aan eind → NL decimaal
    if (/^-?\d{1,3}(\.\d{3})*(,\d+)?$/.test(v)) return true; // NL: 1.234,56
    if (/^-?\d+(,\d+)?$/.test(v)) return true; // NL simpel: 1234,56
    if (/^-?\d+(\.\d+)?$/.test(v)) return true; // Integer of EN decimaal: 1234.56
    if (/^-?\d{1,3}(,\d{3})*(\.\d+)?$/.test(v)) return true; // EN: 1,234.56
    return false;
  }

  /** @internal */
  function isDateLike(str) {
    var v = str.trim();
    if (!v) return false;
    // ISO 8601: 2026-03-09 of 2026-03-09T...
    if (/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(v)) {
      var parts = v.slice(0, 10).split('-');
      var m = parseInt(parts[1], 10);
      var d = parseInt(parts[2], 10);
      return m >= 1 && m <= 12 && d >= 1 && d <= 31;
    }
    // NL: dd-mm-yyyy of dd/mm/yyyy
    if (/^\d{2}[-\/]\d{2}[-\/]\d{4}$/.test(v)) {
      var sep = v.indexOf('/') > -1 ? '/' : '-';
      var p = v.split(sep);
      var day = parseInt(p[0], 10);
      var mon = parseInt(p[1], 10);
      return mon >= 1 && mon <= 12 && day >= 1 && day <= 31;
    }
    return false;
  }

  /** @internal */
  var BOOL_TRUE = ['ja', 'true', 'yes', 'waar', '1'];
  var BOOL_FALSE = ['nee', 'false', 'no', 'onwaar', '0'];

  /** @internal */
  function isBooleanLike(str) {
    var v = str.trim().toLowerCase();
    return BOOL_TRUE.indexOf(v) !== -1 || BOOL_FALSE.indexOf(v) !== -1;
  }

  /**
   * Infereer kolomtypes op basis van data-waarden.
   * @param {string[][]} dataRows - Rijen zonder header
   * @param {string[]} headers - Genormaliseerde kolomnamen
   * @param {Object} [options]
   * @returns {{ name:string, inferredType:string, nullable:boolean, enumValues?:string[] }[]}
   */
  function inferColumnTypes(dataRows, headers, options) {
    options = options || {};
    var threshold = options.typeThreshold || 0.9;
    var enumMax = options.enumThreshold || 30;
    var typeHints = options.typeHints || {};

    return headers.map(function(header, colIdx) {
      // Verzamel non-null waarden
      var nonNull = [];
      var nullCount = 0;

      for (var r = 0; r < dataRows.length; r++) {
        var raw = colIdx < dataRows[r].length ? dataRows[r][colIdx] : '';
        if (isNullValue(raw)) {
          nullCount++;
        } else {
          nonNull.push(raw.trim());
        }
      }

      var total = nonNull.length;
      var nullable = nullCount > 0;

      // TypeHint override
      if (typeHints[header]) {
        var result = { name: header, inferredType: typeHints[header], nullable: nullable };
        if (typeHints[header] === 'enum') {
          var uniq = {};
          nonNull.forEach(function(v) { uniq[v] = true; });
          result.enumValues = Object.keys(uniq).sort();
        }
        return result;
      }

      // Alles null → text
      if (total === 0) {
        return { name: header, inferredType: 'text', nullable: true };
      }

      // 1. Boolean check (eerst: strikt, max 3 unieke waarden)
      var uniqueVals = {};
      nonNull.forEach(function(v) { uniqueVals[v.trim().toLowerCase()] = true; });
      var uniqueCount = Object.keys(uniqueVals).length;

      if (uniqueCount <= 3) {
        var boolMatch = nonNull.filter(function(v) { return isBooleanLike(v); }).length;
        if (boolMatch === total) {
          return { name: header, inferredType: 'boolean', nullable: nullable };
        }
      }

      // 2. Number check
      var numMatch = nonNull.filter(function(v) { return isNumberLike(v); }).length;
      if (numMatch / total >= threshold) {
        return { name: header, inferredType: 'number', nullable: nullable };
      }

      // 3. Date check
      var dateMatch = nonNull.filter(function(v) { return isDateLike(v); }).length;
      if (dateMatch / total >= threshold) {
        return { name: header, inferredType: 'date', nullable: nullable };
      }

      // 4. Enum check: text met ≤ enumMax unieke waarden
      var rawUniq = {};
      nonNull.forEach(function(v) { rawUniq[v] = true; });
      var rawUniqueCount = Object.keys(rawUniq).length;

      if (rawUniqueCount <= enumMax) {
        return {
          name: header,
          inferredType: 'enum',
          nullable: nullable,
          enumValues: Object.keys(rawUniq).sort()
        };
      }

      // 5. Text fallback
      return { name: header, inferredType: 'text', nullable: nullable };
    });
  }

  // ══════════════════════════════════════════════════════════════
  // ── STAP 4: WAARDE-CONVERSIE ────────────────────────────────
  // ══════════════════════════════════════════════════════════════

  /**
   * Parse NL-geformateerd getal.
   * "1.234,56" → 1234.56
   * @param {string} str
   * @returns {number} NaN bij falen
   */
  function parseNLNumber(str) {
    var v = str.trim();
    // Strip currency
    v = v.replace(/^[\s]*(?:EUR|€|USD|\$)[\s]*/i, '').replace(/[\s]*(?:EUR|€|USD|\$)[\s]*$/i, '');
    // Strip percentage
    v = v.replace(/%\s*$/, '');
    v = v.trim();
    if (!v) return NaN;

    // Detecteer NL format: als komma aanwezig is als decimaalteken
    // NL: punt=duizend, komma=decimaal → verwijder punten, vervang komma door punt
    if (v.indexOf(',') > -1) {
      // NL format
      v = v.replace(/\./g, '').replace(',', '.');
    }
    // Anders: EN format of plain integer (punten zijn decimalen)
    // Verwijder duizendscheidingstekens (komma's in EN)
    else {
      v = v.replace(/,/g, '');
    }

    var n = Number(v);
    return n;
  }

  /**
   * Parse datum-string naar ISO 8601 (YYYY-MM-DD).
   * @param {string} str
   * @returns {string|null} ISO datum of null
   */
  function parseDate(str) {
    var v = str.trim();
    if (!v) return null;

    // ISO 8601: 2026-03-09 of 2026-03-09T...
    if (/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(v)) {
      return v.slice(0, 10);
    }

    // NL: dd-mm-yyyy of dd/mm/yyyy
    if (/^\d{2}[-\/]\d{2}[-\/]\d{4}$/.test(v)) {
      var sep = v.indexOf('/') > -1 ? '/' : '-';
      var p = v.split(sep);
      return p[2] + '-' + p[1] + '-' + p[0];
    }

    return null;
  }

  /**
   * Parse boolean-string.
   * @param {string} str
   * @returns {boolean|null}
   */
  function parseBoolean(str) {
    var v = str.trim().toLowerCase();
    if (BOOL_TRUE.indexOf(v) !== -1) return true;
    if (BOOL_FALSE.indexOf(v) !== -1) return false;
    return null;
  }

  /**
   * Converteer ruwe string naar getypte waarde.
   * @param {string} raw
   * @param {string} targetType - 'number'|'date'|'boolean'|'enum'|'text'
   * @param {string} [locale='nl']
   * @returns {{ value:*, warning:string|null }}
   */
  function convertValue(raw, targetType, locale) {
    if (isNullValue(raw)) return { value: null, warning: null };

    var trimmed = (typeof raw === 'string') ? raw.trim() : String(raw);

    switch (targetType) {
      case 'number':
        var n = (locale === 'en')
          ? Number(trimmed.replace(/,/g, ''))
          : parseNLNumber(trimmed);
        if (isNaN(n)) {
          return { value: null, warning: "kolom bevat niet-numerieke waarde '" + trimmed + "'" };
        }
        return { value: n, warning: null };

      case 'date':
        var d = parseDate(trimmed);
        if (d === null) {
          return { value: null, warning: "kolom bevat niet-parseerbare datum '" + trimmed + "'" };
        }
        return { value: d, warning: null };

      case 'boolean':
        var b = parseBoolean(trimmed);
        if (b === null) {
          return { value: null, warning: "kolom bevat niet-parseerbare boolean '" + trimmed + "'" };
        }
        return { value: b, warning: null };

      case 'enum':
      case 'text':
      default:
        return { value: trimmed, warning: null };
    }
  }

  // ══════════════════════════════════════════════════════════════
  // ── STAP 5: SCHEMA GENERATIE ────────────────────────────────
  // ══════════════════════════════════════════════════════════════

  /**
   * Bouw schema-object uit type-inferentie resultaten.
   * @param {{ name:string, inferredType:string, nullable:boolean, enumValues?:string[] }[]} typeResults
   * @returns {{ fields: { name:string, type:string, nullable:boolean, enumValues?:string[] }[] }}
   */
  function buildSchema(typeResults) {
    return {
      fields: typeResults.map(function(t) {
        var field = {
          name: t.name,
          type: t.inferredType,
          nullable: t.nullable
        };
        if (t.enumValues) field.enumValues = t.enumValues;
        return field;
      })
    };
  }

  // ══════════════════════════════════════════════════════════════
  // ── STAP 6: VALIDATIE & OUTPUT ──────────────────────────────
  // ══════════════════════════════════════════════════════════════

  /**
   * Valideer het samengestelde datasetContract.
   * @param {{ records:Object[], schema:Object, sourceMeta:Object }} dataset
   * @returns {string[]} Waarschuwingen (leeg = schoon)
   */
  function validateOutput(dataset) {
    var warnings = [];

    if (!dataset.records || !Array.isArray(dataset.records)) {
      warnings.push('records is geen array');
      return warnings;
    }

    if (dataset.records.length === 0) {
      warnings.push('dataset bevat geen records');
      return warnings;
    }

    // Check keys consistent
    var firstKeys = Object.keys(dataset.records[0]).sort().join(',');
    for (var i = 1; i < Math.min(dataset.records.length, 10); i++) {
      var keys = Object.keys(dataset.records[i]).sort().join(',');
      if (keys !== firstKeys) {
        warnings.push('rij ' + (i + 1) + ' heeft afwijkende keys');
        break;
      }
    }

    // Check schema-match
    if (dataset.schema && dataset.schema.fields) {
      var schemaNames = dataset.schema.fields.map(function(f) { return f.name; }).sort().join(',');
      if (schemaNames !== firstKeys) {
        warnings.push('schema.fields matcht niet met record keys');
      }
    }

    return warnings;
  }

  // ══════════════════════════════════════════════════════════════
  // ── HOOFDFUNCTIE: parseCSV() ────────────────────────────────
  // ══════════════════════════════════════════════════════════════

  /**
   * Transformeer ruwe CSV-tekst naar een datasetContract.
   *
   * @param {string} csvText - Ruwe CSV-inhoud (UTF-8)
   * @param {Object} [options]
   * @param {string} [options.filename] - Bronnaam voor sourceMeta
   * @param {string} [options.delimiter] - Forceer delimiter (auto-detect indien weggelaten)
   * @param {string} [options.locale='nl'] - 'nl' of 'en' voor getalnotatie
   * @param {Object} [options.typeHints] - Per-kolom type overrides: { naam: 'text'|'number'|... }
   * @param {number} [options.enumThreshold=30] - Max unieke waarden voor enum-detectie
   * @param {number} [options.typeThreshold=0.9] - Min ratio voor type-toekenning
   * @returns {{ records:Object[], schema:Object, sourceMeta:Object }}
   */
  function parseCSV(csvText, options) {
    options = options || {};
    var locale = options.locale || 'nl';
    var warnings = [];

    // Stap 0: BOM verwijderen
    csvText = removeBOM(csvText);

    // Stap 1: Parsing
    var delimiter = options.delimiter || detectDelimiter(csvText);
    var grid = tokenizeCSV(csvText, delimiter);

    if (grid.length === 0) {
      return {
        records: [],
        schema: { fields: [] },
        sourceMeta: {
          filename: options.filename || '',
          rowCount: 0,
          delimiter: delimiter,
          parseWarnings: ['CSV is leeg']
        }
      };
    }

    if (grid.length === 1) {
      // Alleen header, geen data
      var hdrs = normalizeHeaders(grid[0]);
      return {
        records: [],
        schema: { fields: hdrs.map(function(h) { return { name: h, type: 'text', nullable: true }; }) },
        sourceMeta: {
          filename: options.filename || '',
          rowCount: 0,
          delimiter: delimiter,
          parseWarnings: ['CSV bevat geen datarijen']
        }
      };
    }

    // Stap 2: Header normalisatie
    var headers = normalizeHeaders(grid[0]);
    var dataRows = grid.slice(1);

    // Stap 3: Type inferentie
    var typeResults = inferColumnTypes(dataRows, headers, options);

    // Stap 4: Waarde-conversie
    var records = [];
    for (var r = 0; r < dataRows.length; r++) {
      var row = {};
      for (var c = 0; c < headers.length; c++) {
        var raw = c < dataRows[r].length ? dataRows[r][c] : '';
        var result = convertValue(raw, typeResults[c].inferredType, locale);
        row[headers[c]] = result.value;
        if (result.warning) {
          warnings.push('Rij ' + (r + 2) + ': ' + headers[c] + ' ' + result.warning);
        }
      }
      records.push(row);
    }

    // Stap 5: Schema generatie
    var schema = buildSchema(typeResults);

    // Stap 6: Assemblage en validatie
    var dataset = {
      records: records,
      schema: schema,
      sourceMeta: {
        filename: options.filename || '',
        rowCount: records.length,
        delimiter: delimiter,
        parseWarnings: warnings
      }
    };

    var validationWarnings = validateOutput(dataset);
    dataset.sourceMeta.parseWarnings = dataset.sourceMeta.parseWarnings.concat(validationWarnings);

    return dataset;
  }

  // ══════════════════════════════════════════════════════════════
  // ── PUBLIEKE API ────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════

  var CsvAdapter = {
    version: VERSION,
    parseCSV: parseCSV,
    // Individuele stappen (voor testen en geavanceerd gebruik):
    removeBOM: removeBOM,
    detectDelimiter: detectDelimiter,
    tokenizeCSV: tokenizeCSV,
    toCamelCase: toCamelCase,
    normalizeHeaders: normalizeHeaders,
    isNullValue: isNullValue,
    inferColumnTypes: inferColumnTypes,
    convertValue: convertValue,
    parseNLNumber: parseNLNumber,
    parseDate: parseDate,
    parseBoolean: parseBoolean,
    buildSchema: buildSchema,
    validateOutput: validateOutput
  };

  // Export: browser (global) of Node.js (module)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CsvAdapter;
  } else {
    global.CsvAdapter = CsvAdapter;
  }

})(typeof window !== 'undefined' ? window : this);
