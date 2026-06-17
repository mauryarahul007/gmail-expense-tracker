const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const { Expense, Config } = require('./db');
const {
  isClientAuthenticated,
  getOAuthClient,
  getAuthUrl,
  saveToken,
  fetchTransactionEmails,
  CREDENTIALS_PATH,
  TOKEN_PATH
} = require('./gmail-client');

const { parseEmail } = require('./parser');
const { parseStatementCSV } = require('./statement-parser');
const { reconcileStatementWithDB } = require('./statement-reconcile');
const multer = require('multer');

const app = express();
// Multer: store uploaded files in memory (no disk I/O needed)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Connect to MongoDB Atlas (or local fallback)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spendflow';
console.log(`Connecting to MongoDB...`);
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch(err => {
    console.error('CRITICAL: MongoDB connection failed!', err.message);
    console.log('Ensure you have specified a valid MONGODB_URI in your environment settings.');
  });

app.use(cors({ origin: '*' })); // Allow client-side requests from any origin (e.g. Vercel)
app.use(express.json({ limit: '10mb' }));

/**
 * 1. Check Authentication Status
 */
app.get('/api/auth/status', async (req, res) => {
  try {
    const hasCredentials = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) || 
                           fs.existsSync(CREDENTIALS_PATH) || 
                           !!(await Config.findOne({ key: 'google_credentials' }));
    const isAuthenticated = await isClientAuthenticated();
    res.json({
      hasCredentials,
      isAuthenticated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 2. Upload Credentials directly from the frontend Setup Wizard
 */
app.post('/api/auth/credentials', async (req, res) => {
  try {
    const { client_id, client_secret, redirect_uri } = req.body;
    
    if (!client_id || !client_secret) {
      return res.status(400).json({ error: 'Client ID and Client Secret are required.' });
    }

    const uri = redirect_uri || `http://localhost:${PORT}/api/auth/callback`;

    // Construct the standard Google credentials.json format
    const credentialsObj = {
      web: {
        client_id,
        project_id: 'gmail-expense-tracker',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_secret,
        redirect_uris: [uri]
      }
    };

    // Save to Database (Cloud Persistence)
    await Config.findOneAndUpdate(
      { key: 'google_credentials' },
      { value: credentialsObj },
      { upsert: true, new: true }
    );

    // Save locally for development fallback
    try {
      fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(credentialsObj, null, 2));
    } catch (e) {
      console.warn('Could not write local credentials.json fallback:', e.message);
    }

    res.json({ success: true, message: 'OAuth credentials saved successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save credentials: ' + err.message });
  }
});

/**
 * 3. Get Google Consent Screen URL
 */
app.get('/api/auth/url', async (req, res) => {
  try {
    const url = await getAuthUrl();
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4. OAuth Callback Route
 */
app.get('/api/auth/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('Authorization code missing.');
  }

  try {
    await saveToken(code);
    // Redirect back to frontend
    res.redirect(`${FRONTEND_URL}/?auth=success`);
  } catch (err) {
    console.error('Error exchanging authorization code:', err);
    res.status(500).send(`Authentication failed: ${err.message}`);
  }
});

/**
 * 5. Logout (Clear Token)
 */
app.post('/api/auth/logout', async (req, res) => {
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      fs.unlinkSync(TOKEN_PATH);
    }
    await Config.deleteOne({ key: 'google_oauth_tokens' });
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 6. Get All Synced Expenses
 */
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve expenses: ' + err.message });
  }
});

/**
 * 7. Sync Gmail Inbox
 */
app.post('/api/sync', async (req, res) => {
  try {
    if (!(await isClientAuthenticated())) {
      return res.status(401).json({ error: 'Not authenticated. Please connect to Gmail.' });
    }

    const { query, limit = 500 } = req.body;
    
    // Fetch transaction emails
    const emails = await fetchTransactionEmails(query, limit);
    
    // Read current database to prevent duplicates
    const existingExpenses = await Expense.find({}, { id: 1 });
    const existingIds = new Set(existingExpenses.map(e => e.id));
    
    let addedCount = 0;
    const newExpenses = [];

    // Parse each email
    for (const email of emails) {
      if (existingIds.has(email.id)) {
        continue;
      }

      const parsed = parseEmail(email);
      if (parsed) {
        newExpenses.push(parsed);
        addedCount++;
      }
    }

    // Insert to MongoDB
    if (newExpenses.length > 0) {
      await Expense.insertMany(newExpenses);
    }

    const totalCount = await Expense.countDocuments();

    res.json({
      success: true,
      addedCount,
      totalCount
    });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ error: 'Sync failed: ' + err.message });
  }
});

/**
 * 8. Manual Overrides: Update Expense Details (Category adjustment)
 */
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // e.g. { category, amount, merchant, date }
    
    const updatedExpense = await Expense.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    );
    
    if (!updatedExpense) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    res.json({ success: true, expense: updatedExpense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 9. Manual Overrides: Delete Expense
 */
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Expense.findOneAndDelete({ id });
    
    if (!deleted) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    res.json({ success: true, message: 'Expense deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 10. Manual Upload / Paste EML or MBOX Content
 */
app.post('/api/upload-raw', async (req, res) => {
  try {
    const { subject, snippet, body, from, date } = req.body;
    
    if (!subject || !body) {
      return res.status(400).json({ error: 'Subject and Body are required.' });
    }

    const mockId = 'raw-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const parsed = parseEmail({
      id: mockId,
      subject,
      snippet: snippet || body.substring(0, 150),
      body,
      from: from || 'manual-upload@local.com',
      date: date || new Date().toISOString()
    });

    if (!parsed) {
      return res.status(400).json({ error: 'Could not extract any expense amount from the raw email content.' });
    }

    const createdExpense = await Expense.create(parsed);
    res.json({ success: true, expense: createdExpense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 11. Add Manual Expense
 */
app.post('/api/expenses', async (req, res) => {
  try {
    const { date, amount, currency, merchant, category, snippet } = req.body;
    
    if (!date || !amount || !merchant) {
      return res.status(400).json({ error: 'Date, amount, and merchant are required.' });
    }

    const manualId = 'manual-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const newExpense = new Expense({
      id: manualId,
      date: new Date(date),
      amount: Number(amount),
      currency: currency || 'INR',
      merchant,
      category: category || 'Other',
      subject: 'Manual Transaction',
      snippet: snippet || '',
      from: 'Manual Entry',
      bodySummary: snippet || ''
    });

    await newExpense.save();
    res.json({ success: true, expense: newExpense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 12. Upload & Reconcile Bank Statement (CSV)
 *
 * Accepts a multipart/form-data POST with a single file field named "statement".
 * Parses the CSV, cross-references against the DB, updates categories/merchants
 * where bank narration gives a better signal, and inserts missing transactions.
 */
app.post('/api/upload-statement', upload.single('statement'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please attach a CSV bank statement.' });
    }

    const mimetype = req.file.mimetype || '';
    const filename = req.file.originalname || '';
    if (!filename.toLowerCase().endsWith('.csv') && !mimetype.includes('csv') && !mimetype.includes('text')) {
      return res.status(400).json({ error: 'Only CSV files are supported. Please export your bank statement as CSV.' });
    }

    const csvContent = req.file.buffer.toString('utf-8');

    // 1. Parse the CSV into normalised transaction rows
    let statementTransactions;
    try {
      statementTransactions = parseStatementCSV(csvContent);
    } catch (parseErr) {
      return res.status(422).json({ error: 'Could not parse CSV: ' + parseErr.message });
    }

    if (statementTransactions.length === 0) {
      return res.status(422).json({ error: 'No valid debit transactions found in the uploaded statement. Check the file format.' });
    }

    // 2. Reconcile against the database
    const report = await reconcileStatementWithDB(statementTransactions);

    res.json({ success: true, ...report });
  } catch (err) {
    console.error('Statement upload error:', err);
    res.status(500).json({ error: 'Statement processing failed: ' + err.message });
  }
});

/**
 * 13. Purge Bank Statement Imports Outside a Date Range
 *
 * DELETE /api/purge-statement-imports
 * Body: { startDate?: ISO string, endDate?: ISO string }
 *
 * Deletes all stmt- expenses whose date falls OUTSIDE [startDate, endDate].
 * Used to clean up wrongly-dated statement imports.
 * If no range is given, deletes ALL stmt- records.
 */
app.delete('/api/purge-statement-imports', async (req, res) => {
  try {
    const { startDate, endDate } = req.body || {};

    const filter = { id: /^stmt-/ };

    if (startDate || endDate) {
      // Delete records OUTSIDE the valid range: date < startDate OR date > endDate
      const conditions = [];
      if (startDate) conditions.push({ date: { $lt: new Date(startDate) } });
      if (endDate)   conditions.push({ date: { $gt: new Date(endDate) } });
      if (conditions.length > 0) filter.$or = conditions;
    }

    const result = await Expense.deleteMany(filter);
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
