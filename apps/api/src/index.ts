import express, { Request, Response } from 'express';
import cors from 'cors';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock Database
const mockUser = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1-555-0123',
  createdAt: new Date('2026-01-01'),
};

let mockAccounts = [
  {
    id: 'acc-1',
    userId: 'user-123',
    type: 'Checking',
    balance: 5234.50,
    accountNumber: '****1234',
    status: 'active',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date(),
  },
  {
    id: 'acc-2',
    userId: 'user-123',
    type: 'Savings',
    balance: 12000.00,
    accountNumber: '****5678',
    status: 'active',
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date(),
  },
  {
    id: 'acc-3',
    userId: 'user-123',
    type: 'Money Market',
    balance: 8500.75,
    accountNumber: '****9012',
    status: 'active',
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date(),
  },
];

let mockTransactions = [
  {
    id: 'txn-1',
    accountId: 'acc-1',
    type: 'debit',
    description: 'ATM Withdrawal',
    amount: -100.00,
    balance: 5334.50,
    status: 'completed',
    date: new Date('2026-09-12'),
    reference: 'ATM-001',
  },
  {
    id: 'txn-2',
    accountId: 'acc-1',
    type: 'credit',
    description: 'Direct Deposit - Salary',
    amount: 3000.00,
    balance: 5234.50,
    status: 'completed',
    date: new Date('2026-09-13'),
    reference: 'DD-SEP2026',
  },
  {
    id: 'txn-3',
    accountId: 'acc-2',
    type: 'credit',
    description: 'Transfer from Checking',
    amount: 500.00,
    balance: 12000.00,
    status: 'completed',
    date: new Date('2026-09-10'),
    reference: 'TRF-001',
  },
];

let mockPayments = [
  {
    id: 'pay-1',
    fromAccountId: 'acc-1',
    toAccountId: 'acc-2',
    amount: 250.00,
    description: 'Monthly transfer',
    status: 'completed',
    createdAt: new Date('2026-09-08'),
    completedAt: new Date('2026-09-08'),
    reference: 'TRF-PAY-001',
  },
  {
    id: 'pay-2',
    fromAccountId: 'acc-2',
    toAccountId: 'acc-1',
    amount: 150.00,
    description: 'Bill payment',
    status: 'completed',
    createdAt: new Date('2026-09-05'),
    completedAt: new Date('2026-09-05'),
    reference: 'TRF-PAY-002',
  },
];

// ===== USER ENDPOINTS =====

/**
 * GET /api/user
 * Returns current user information
 */
app.get('/api/user', (req: Request, res: Response) => {
  console.log('[API] GET /api/user');
  res.json(mockUser);
});

// ===== ACCOUNTS ENDPOINTS =====

/**
 * GET /api/accounts
 * Returns all accounts for the user
 */
app.get('/api/accounts', (req: Request, res: Response) => {
  console.log('[API] GET /api/accounts');
  res.json(mockAccounts);
});

/**
 * GET /api/accounts/:id
 * Returns specific account details
 */
app.get('/api/accounts/:id', (req: Request, res: Response) => {
  console.log(`[API] GET /api/accounts/${req.params.id}`);
  const account = mockAccounts.find((acc) => acc.id === req.params.id);

  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  res.json(account);
});

/**
 * POST /api/accounts
 * Creates a new account
 */
app.post('/api/accounts', (req: Request, res: Response) => {
  const { type } = req.body;

  if (!type) {
    return res.status(400).json({ error: 'Account type is required' });
  }

  const newAccount = {
    id: `acc-${uuidv4()}`,
    userId: 'user-123',
    type,
    balance: 0,
    accountNumber: `****${Math.floor(Math.random() * 9000) + 1000}`,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockAccounts.push(newAccount);
  console.log('[API] POST /api/accounts - Account created:', newAccount.id);

  res.status(201).json(newAccount);
});

// ===== TRANSACTIONS ENDPOINTS =====

/**
 * GET /api/transactions
 * Returns all transactions
 */
app.get('/api/transactions', (req: Request, res: Response) => {
  console.log('[API] GET /api/transactions');
  // Sort by date descending (newest first)
  const sorted = [...mockTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  res.json(sorted);
});

/**
 * GET /api/transactions/:id
 * Returns specific transaction
 */
app.get('/api/transactions/:id', (req: Request, res: Response) => {
  console.log(`[API] GET /api/transactions/${req.params.id}`);
  const transaction = mockTransactions.find((txn) => txn.id === req.params.id);

  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  res.json(transaction);
});

/**
 * POST /api/transactions
 * Creates a new transaction (internal use)
 */
app.post('/api/transactions', (req: Request, res: Response) => {
  const { accountId, type, description, amount } = req.body;

  if (!accountId || !type || !description || !amount) {
    return res
      .status(400)
      .json({ error: 'Missing required transaction fields' });
  }

  const account = mockAccounts.find((acc) => acc.id === accountId);
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const newBalance = account.balance + amount;

  const newTransaction = {
    id: `txn-${uuidv4()}`,
    accountId,
    type,
    description,
    amount,
    balance: newBalance,
    status: 'completed',
    date: new Date(),
    reference: `TXN-${Date.now()}`,
  };

  mockTransactions.push(newTransaction);
  console.log('[API] POST /api/transactions - Transaction created:', newTransaction.id);

  res.status(201).json(newTransaction);
});

// ===== PAYMENTS ENDPOINTS =====

/**
 * GET /api/payments
 * Returns all payments
 */
app.get('/api/payments', (req: Request, res: Response) => {
  console.log('[API] GET /api/payments');
  // Sort by date descending
  const sorted = [...mockPayments].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(sorted);
});

/**
 * GET /api/payments/:id
 * Returns specific payment
 */
app.get('/api/payments/:id', (req: Request, res: Response) => {
  console.log(`[API] GET /api/payments/${req.params.id}`);
  const payment = mockPayments.find((pay) => pay.id === req.params.id);

  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  res.json(payment);
});

/**
 * POST /api/payments
 * Creates a new payment
 * THIS IS THE KEY ENDPOINT - Processes payments between accounts
 */
app.post('/api/payments', (req: Request, res: Response) => {
  const { fromAccountId, toAccountId, amount, description } = req.body;

  console.log('[API] POST /api/payments - Processing payment:', {
    fromAccountId,
    toAccountId,
    amount,
  });

  // Validation
  if (!fromAccountId || !toAccountId || !amount) {
    return res
      .status(400)
      .json({ error: 'Missing required payment fields' });
  }

  if (fromAccountId === toAccountId) {
    return res.status(400).json({ error: 'Cannot pay to same account' });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: 'Amount must be positive' });
  }

  // Find accounts
  const fromAccount = mockAccounts.find((acc) => acc.id === fromAccountId);
  const toAccount = mockAccounts.find((acc) => acc.id === toAccountId);

  if (!fromAccount || !toAccount) {
    return res.status(404).json({ error: 'One or both accounts not found' });
  }

  if (fromAccount.balance < amount) {
    return res.status(400).json({ error: 'Insufficient funds' });
  }

  // Process payment
  fromAccount.balance -= amount;
  toAccount.balance += amount;
  fromAccount.updatedAt = new Date();
  toAccount.updatedAt = new Date();

  // Create payment record
  const newPayment = {
    id: `pay-${uuidv4()}`,
    fromAccountId,
    toAccountId,
    amount,
    description: description || 'Bank transfer',
    status: 'completed',
    createdAt: new Date(),
    completedAt: new Date(),
    reference: `PAY-${Date.now()}`,
  };

  mockPayments.push(newPayment);

  // Create transactions for both accounts
  const fromTransaction = {
    id: `txn-${uuidv4()}`,
    accountId: fromAccountId,
    type: 'debit',
    description: `Payment to ${toAccount.type}`,
    amount: -amount,
    balance: fromAccount.balance,
    status: 'completed',
    date: new Date(),
    reference: newPayment.id,
  };

  const toTransaction = {
    id: `txn-${uuidv4()}`,
    accountId: toAccountId,
    type: 'credit',
    description: `Payment from ${fromAccount.type}`,
    amount: amount,
    balance: toAccount.balance,
    status: 'completed',
    date: new Date(),
    reference: newPayment.id,
  };

  mockTransactions.push(fromTransaction);
  mockTransactions.push(toTransaction);

  console.log('[API] POST /api/payments - Payment completed:', newPayment.id);
  console.log(
    `[API] From account balance: $${fromAccount.balance.toFixed(2)}`
  );
  console.log(`[API] To account balance: $${toAccount.balance.toFixed(2)}`);

  res.status(201).json(newPayment);
});

/**
 * POST /api/payments/:id/confirm
 * Confirms a pending payment
 */
app.post('/api/payments/:id/confirm', (req: Request, res: Response) => {
  const payment = mockPayments.find((pay) => pay.id === req.params.id);

  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  if (payment.status !== 'pending') {
    return res.status(400).json({ error: 'Payment is not pending' });
  }

  payment.status = 'completed';
  payment.completedAt = new Date();

  console.log('[API] POST /api/payments/:id/confirm - Payment confirmed:', req.params.id);

  res.json(payment);
});

// ===== HEALTH CHECK =====

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// ===== ERROR HANDLING =====

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  console.log(`[API] 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method,
  });
});

// ===== START SERVER =====

app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║   🏦 Banking Platform - Backend API          ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('');
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('Available Endpoints:');
  console.log('  GET    /health');
  console.log('  GET    /api/user');
  console.log('  GET    /api/accounts');
  console.log('  GET    /api/accounts/:id');
  console.log('  POST   /api/accounts');
  console.log('  GET    /api/transactions');
  console.log('  GET    /api/transactions/:id');
  console.log('  POST   /api/transactions');
  console.log('  GET    /api/payments');
  console.log('  GET    /api/payments/:id');
  console.log('  POST   /api/payments          ← KEY ENDPOINT');
  console.log('  POST   /api/payments/:id/confirm');
  console.log('');
  console.log('Accounts:');
  console.log('  1. Checking  - $5,234.50   (****1234)');
  console.log('  2. Savings   - $12,000.00  (****5678)');
  console.log('  3. Money Mkt - $8,500.75   (****9012)');
  console.log('');
  console.log('CORS enabled - Ready for MFE requests');
  console.log('');
});

export default app;
