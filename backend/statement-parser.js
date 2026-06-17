/**
 * CSV Bank Statement Parser
 * Supports: HDFC, ICICI, SBI, Axis Bank, Kotak, and generic Indian bank CSV exports.
 */
const { parse } = require('csv-parse/sync');

// ─── Bank Format Detection ────────────────────────────────────────────────────

function detectBankFormat(headers) {
  const h = headers.map(col => col.toLowerCase().trim());

  if (h.includes('narration') && h.includes('debit amount'))               return 'hdfc';
  if (h.includes('description') && h.some(c => c === 'debit'))             return 'icici';
  if (h.some(c => c.includes('transaction remarks')))                       return 'axis';
  if (h.some(c => c.includes('withdrawal amt')))                            return 'kotak';
  if (h.includes('particulars') || h.includes('narration'))                 return 'sbi';
  return 'generic';
}

// ─── Date Parsers ─────────────────────────────────────────────────────────────

function parseDate(raw) {
  if (!raw) return null;
  const s = raw.trim();

  // DD/MM/YYYY  (HDFC)
  const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) return new Date(`${slash[3]}-${slash[2].padStart(2,'0')}-${slash[1].padStart(2,'0')}`);

  // DD-Mon-YYYY  (ICICI / SBI)
  const dashMon = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (dashMon) return new Date(`${dashMon[1]} ${dashMon[2]} ${dashMon[3]}`);

  // DD-MM-YYYY  (Axis)
  const dashNum = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dashNum) return new Date(`${dashNum[3]}-${dashNum[2]}-${dashNum[1]}`);

  // YYYY-MM-DD  (ISO / generic)
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return new Date(s);

  // DD.MM.YYYY
  const dot = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dot) return new Date(`${dot[3]}-${dot[2]}-${dot[1]}`);

  const fallback = new Date(s);
  return isNaN(fallback.getTime()) ? null : fallback;
}

function cleanAmount(raw) {
  if (!raw && raw !== 0) return 0;
  const str = String(raw).replace(/,/g, '').replace(/[^\d.]/g, '').trim();
  const n = parseFloat(str);
  return isNaN(n) ? 0 : n;
}

// ─── Row Extractors per Bank ──────────────────────────────────────────────────

function extractHdfc(row) {
  const keys = Object.keys(row);
  const dateKey   = keys.find(k => k.trim().toLowerCase() === 'date');
  const narrKey   = keys.find(k => k.trim().toLowerCase() === 'narration');
  const debitKey  = keys.find(k => k.trim().toLowerCase() === 'debit amount');
  const creditKey = keys.find(k => k.trim().toLowerCase() === 'credit amount');

  const debit  = cleanAmount(row[debitKey]);
  const credit = cleanAmount(row[creditKey]);

  return {
    date:        parseDate(row[dateKey]),
    description: (row[narrKey] || '').trim(),
    amount:      debit > 0 ? debit : credit,
    type:        debit > 0 ? 'debit' : (credit > 0 ? 'credit' : null)
  };
}

function extractIcici(row) {
  const keys = Object.keys(row);
  const dateKey   = keys.find(k => /transaction\s*date/i.test(k));
  const descKey   = keys.find(k => /^description$/i.test(k.trim()));
  const debitKey  = keys.find(k => /^debit$/i.test(k.trim()));
  const creditKey = keys.find(k => /^credit$/i.test(k.trim()));

  const debit  = cleanAmount(row[debitKey]);
  const credit = cleanAmount(row[creditKey]);

  return {
    date:        parseDate(row[dateKey]),
    description: (row[descKey] || '').trim(),
    amount:      debit > 0 ? debit : credit,
    type:        debit > 0 ? 'debit' : (credit > 0 ? 'credit' : null)
  };
}

function extractAxis(row) {
  const keys = Object.keys(row);
  const dateKey    = keys.find(k => /transaction\s*date/i.test(k));
  const descKey    = keys.find(k => /transaction\s*remarks/i.test(k));
  const withdrawKey = keys.find(k => /withdrawal/i.test(k));
  const depositKey  = keys.find(k => /deposit/i.test(k));

  const debit  = cleanAmount(row[withdrawKey]);
  const credit = cleanAmount(row[depositKey]);

  return {
    date:        parseDate(row[dateKey]),
    description: (row[descKey] || '').trim(),
    amount:      debit > 0 ? debit : credit,
    type:        debit > 0 ? 'debit' : (credit > 0 ? 'credit' : null)
  };
}

function extractKotak(row) {
  const keys = Object.keys(row);
  const dateKey    = keys.find(k => /transaction\s*date/i.test(k));
  const descKey    = keys.find(k => /description/i.test(k));
  const withdrawKey = keys.find(k => /withdrawal/i.test(k));
  const depositKey  = keys.find(k => /deposit/i.test(k));

  const debit  = cleanAmount(row[withdrawKey]);
  const credit = cleanAmount(row[depositKey]);

  return {
    date:        parseDate(row[dateKey]),
    description: (row[descKey] || '').trim(),
    amount:      debit > 0 ? debit : credit,
    type:        debit > 0 ? 'debit' : (credit > 0 ? 'credit' : null)
  };
}

function extractSbi(row) {
  const keys = Object.keys(row);
  const dateKey   = keys.find(k => /txn\s*date|transaction\s*date/i.test(k));
  const descKey   = keys.find(k => /description|particulars|narration/i.test(k));
  const debitKey  = keys.find(k => /^debit$/i.test(k.trim()));
  const creditKey = keys.find(k => /^credit$/i.test(k.trim()));

  const debit  = cleanAmount(row[debitKey]);
  const credit = cleanAmount(row[creditKey]);

  return {
    date:        parseDate(row[dateKey]),
    description: (row[descKey] || '').trim(),
    amount:      debit > 0 ? debit : credit,
    type:        debit > 0 ? 'debit' : (credit > 0 ? 'credit' : null)
  };
}

function extractGeneric(row) {
  const keys = Object.keys(row);
  const dateKey   = keys.find(k => /date/i.test(k));
  const descKey   = keys.find(k => /desc|narr|remark|particular|detail/i.test(k));
  const debitKey  = keys.find(k => /debit|withdrawal|dr\b/i.test(k));
  const creditKey = keys.find(k => /credit|deposit|cr\b/i.test(k));
  const amtKey    = keys.find(k => /^amount$/i.test(k.trim()));

  const debit  = cleanAmount(row[debitKey]);
  const credit = cleanAmount(row[creditKey]);
  const rawAmt = cleanAmount(row[amtKey]);

  return {
    date:        parseDate(row[dateKey]),
    description: (row[descKey] || '').trim(),
    amount:      debit > 0 ? debit : (credit > 0 ? credit : rawAmt),
    type:        debit > 0 ? 'debit' : (credit > 0 ? 'credit' : (rawAmt > 0 ? 'debit' : null))
  };
}

const EXTRACTORS = { hdfc: extractHdfc, icici: extractIcici, axis: extractAxis, kotak: extractKotak, sbi: extractSbi, generic: extractGeneric };

// ─── Skip rules for non-expense debits ────────────────────────────────────────

const SKIP_PATTERNS = [
  /\batm\s*(wdl|withdrawal|cash)\b/i,
  /\bneft\s*(cr|credit)\b/i,
  /\bimps\s*cr\b/i,
  /\brtgs\s*(cr|credit)\b/i,
  /\btransfer\s*to\s*self\b/i,
  /\bself\s*transfer\b/i,
  /\binterest\s*(paid|credited|earned)\b/i,
  /\bclosing\s*balance\b/i,
  /\bopening\s*balance\b/i,
  /\btds\s*deducted\b/i,
];

function shouldSkip(description) {
  return SKIP_PATTERNS.some(p => p.test(description));
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Parses a CSV bank statement string and returns normalized debit transactions.
 * @param {string} csvContent - Raw CSV text from an uploaded bank statement file.
 * @returns {Array<{date: Date, amount: number, currency: string, description: string, type: string}>}
 */
function parseStatementCSV(csvContent) {
  // Strip BOM if present
  const cleaned = csvContent.replace(/^﻿/, '');

  // Some banks add metadata rows before the header — find the header row
  const lines = cleaned.split('\n').filter(l => l.trim());
  let startRow = 0;
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const lower = lines[i].toLowerCase();
    if ((lower.includes('date') && (lower.includes('amount') || lower.includes('debit') || lower.includes('withdrawal'))) ||
        (lower.includes('narration') || lower.includes('description') || lower.includes('particulars'))) {
      startRow = i;
      break;
    }
  }

  const csvToProcess = lines.slice(startRow).join('\n');

  let records;
  try {
    records = parse(csvToProcess, {
      columns:              true,
      skip_empty_lines:     true,
      trim:                 true,
      relax_column_count:   true,
      skip_records_with_error: true
    });
  } catch (err) {
    throw new Error(`CSV parsing failed: ${err.message}`);
  }

  if (!records || records.length === 0) {
    return [];
  }

  const headers = Object.keys(records[0]);
  const format  = detectBankFormat(headers);
  const extract = EXTRACTORS[format] || EXTRACTORS.generic;

  const results = [];
  for (const row of records) {
    try {
      const tx = extract(row);
      if (!tx || !tx.date || isNaN(tx.date.getTime())) continue;
      if (!tx.amount || tx.amount <= 0)                  continue;
      if (shouldSkip(tx.description))                    continue;
      // Only include debits (outflows) for expense tracking
      if (tx.type !== 'debit')                           continue;

      results.push({
        date:        tx.date,
        amount:      tx.amount,
        currency:    'INR',
        description: tx.description,
        type:        'debit',
        bankFormat:  format
      });
    } catch {
      // Skip malformed rows silently
    }
  }

  return results;
}

module.exports = { parseStatementCSV, detectBankFormat, parseDate };
