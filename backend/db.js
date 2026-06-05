const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: 'INR' },
  merchant: { type: String, required: true },
  category: { type: String, required: true, default: 'Other' },
  subject: { type: String, default: '' },
  snippet: { type: String, default: '' },
  from: { type: String, default: '' },
  bodySummary: { type: String, default: '' }
}, {
  timestamps: true
});

const ConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
}, {
  timestamps: true
});

const Expense = mongoose.model('Expense', ExpenseSchema);
const Config = mongoose.model('Config', ConfigSchema);

module.exports = {
  Expense,
  Config
};
