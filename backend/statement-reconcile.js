/**
 * Bank Statement Reconciliation Engine
 *
 * Cross-references parsed bank statement transactions against the MongoDB
 * expense database. Matches on date (±2 days) + amount (±2%).
 * - Matched entries: re-categorised if bank narration gives better signal.
 * - Unmatched entries: inserted as new expenses (source = bank-statement).
 */
const { Expense } = require('./db');
const { getCategoryByContent, normalizeMerchant } = require('./parser');

const DATE_TOLERANCE_MS  = 2 * 24 * 60 * 60 * 1000; // 2 days
const AMOUNT_TOLERANCE   = 0.02;                      // 2 %

// ─── Matching helpers ─────────────────────────────────────────────────────────

function datesClose(d1, d2) {
  return Math.abs(new Date(d1).getTime() - new Date(d2).getTime()) <= DATE_TOLERANCE_MS;
}

function amountsClose(a1, a2) {
  if (a1 === 0 && a2 === 0) return true;
  const larger = Math.max(Math.abs(a1), Math.abs(a2));
  return Math.abs(a1 - a2) / larger <= AMOUNT_TOLERANCE;
}

// ─── Category / merchant helpers ──────────────────────────────────────────────

function inferFromBankNarration(description) {
  const category = getCategoryByContent(description, description, description, '');
  const merchant  = normalizeMerchant(description, '');
  return { category, merchant };
}

// ─── Main reconciler ──────────────────────────────────────────────────────────

/**
 * @param {Array} statementTransactions - Output of parseStatementCSV()
 * @returns {Promise<Object>} Reconciliation report
 */
async function reconcileStatementWithDB(statementTransactions) {
  if (!statementTransactions || statementTransactions.length === 0) {
    return { totalBankTransactions: 0, matched: 0, updated: 0, added: 0, skipped: 0, updatedDetails: [], addedDetails: [] };
  }

  // Pull all INR expenses from the DB once
  const existingExpenses = await Expense.find({ currency: 'INR' }).lean();

  // Track which DB expenses have already been matched (avoid double-matching)
  const usedIds = new Set();

  let matchedCount  = 0;
  let updatedCount  = 0;
  let addedCount    = 0;
  let skippedCount  = 0;
  const updatedDetails = [];
  const addedDetails   = [];

  for (const stTx of statementTransactions) {
    const txDate   = new Date(stTx.date);
    const txAmount = stTx.amount;

    // ── Try to find a matching DB expense ────────────────────────────────────
    const match = existingExpenses.find(e =>
      !usedIds.has(String(e._id)) &&
      e.currency === 'INR' &&
      datesClose(e.date, txDate) &&
      amountsClose(e.amount, txAmount)
    );

    if (match) {
      usedIds.add(String(match._id));
      matchedCount++;

      // Re-derive category and merchant from bank narration
      const { category: bankCategory, merchant: bankMerchant } = inferFromBankNarration(stTx.description);

      const updates = {};

      // Only upgrade category if bank gives a specific signal (not 'Other')
      if (bankCategory !== 'Other' && bankCategory !== match.category) {
        updates.category = bankCategory;
      }

      // Only upgrade merchant if bank gives a real name (not 'Unknown Merchant')
      if (bankMerchant !== 'Unknown Merchant' && bankMerchant !== match.merchant) {
        updates.merchant = bankMerchant;
      }

      if (Object.keys(updates).length > 0) {
        await Expense.findOneAndUpdate(
          { id: match.id },
          { $set: updates },
          { new: true }
        );
        updatedCount++;
        updatedDetails.push({
          id:          match.id,
          amount:      match.amount,
          date:        match.date,
          oldCategory: match.category,
          newCategory: updates.category  || match.category,
          oldMerchant: match.merchant,
          newMerchant: updates.merchant  || match.merchant,
          bankNarration: stTx.description
        });
      }

    } else {
      // ── No matching expense found — add from bank statement ───────────────
      const { category, merchant } = inferFromBankNarration(stTx.description);

      // Use bank narration as merchant fallback if parser returns unknown
      const finalMerchant = merchant !== 'Unknown Merchant'
        ? merchant
        : stTx.description.substring(0, 40).trim();

      const newId = 'stmt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);

      const newExpense = {
        id:          newId,
        date:        txDate.toISOString(),
        amount:      txAmount,
        currency:    'INR',
        merchant:    finalMerchant,
        category,
        subject:     'Bank Statement Import',
        snippet:     stTx.description.substring(0, 150),
        from:        'bank-statement@import.local',
        bodySummary: stTx.description
      };

      try {
        await Expense.create(newExpense);
        addedCount++;
        addedDetails.push({
          id:       newId,
          amount:   txAmount,
          date:     txDate.toISOString(),
          merchant: finalMerchant,
          category,
          bankNarration: stTx.description
        });
      } catch (err) {
        // Duplicate id guard — skip silently
        skippedCount++;
      }
    }
  }

  return {
    totalBankTransactions: statementTransactions.length,
    matched:  matchedCount,
    updated:  updatedCount,
    added:    addedCount,
    skipped:  skippedCount,
    updatedDetails,
    addedDetails
  };
}

module.exports = { reconcileStatementWithDB };
