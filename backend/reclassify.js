const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { parseEmail } = require('./parser');
const { Expense } = require('./db');

const EXPENSES_PATH = path.join(__dirname, 'data', 'expenses.json');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spendflow';

async function runMigration() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB.');

    if (!fs.existsSync(EXPENSES_PATH)) {
      console.log('No local expenses.json file found to migrate.');
      process.exit(0);
    }

    const content = fs.readFileSync(EXPENSES_PATH, 'utf8');
    const localExpenses = JSON.parse(content);
    console.log(`Found ${localExpenses.length} local expenses. Migrating and reclassifying to MongoDB...`);

    let migratedCount = 0;
    for (const exp of localExpenses) {
      const parsed = parseEmail({
        id: exp.id,
        subject: exp.subject,
        snippet: exp.snippet,
        body: exp.bodySummary || exp.snippet,
        from: exp.from,
        date: exp.date
      });

      const finalExp = parsed ? {
        id: exp.id,
        date: new Date(parsed.date),
        amount: parsed.amount,
        currency: parsed.currency,
        merchant: parsed.merchant,
        category: parsed.category,
        subject: parsed.subject,
        snippet: parsed.snippet,
        from: parsed.from,
        bodySummary: parsed.bodySummary
      } : {
        ...exp,
        date: new Date(exp.date)
      };

      // Upsert into MongoDB by transaction ID
      await Expense.findOneAndUpdate(
        { id: exp.id },
        { $set: finalExp },
        { upsert: true, new: true }
      );
      migratedCount++;
    }

    console.log(`Migration complete! Migrated & reclassified ${migratedCount} expenses directly into your MongoDB database.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
