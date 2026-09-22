import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTransactions, addTransaction, setTransactionsLoading, setTransactionsError } from '@banking/state';
import type { RootState } from '@banking/state';
import type { Transaction } from '@banking/shared-types';
import { Card, LoadingSpinner } from '@banking/shared-ui';
import { NISUM } from '@banking/events';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { list: transactions, loading, error } = useSelector(
    (state: RootState) => state.transactions
  );
  const [filter, setFilter] = useState<string>('all');
  const [recentPayment, setRecentPayment] = useState<string | null>(null);

  useEffect(() => {
    console.log('[MFE Transactions] Component mounted');
    NISUM.emit('mfe-transactions:loaded', { timestamp: new Date().toISOString() });

    fetchTransactions();

    // Listen for payment events from Payments MFE
    const unsubscribePayment = NISUM.listener('payment:created', (data) => {
      console.log('[MFE Transactions] Payment event received:', data);
      setRecentPayment(data.paymentId);
      setTimeout(() => setRecentPayment(null), 3000);

      // Create transaction object from payment data
      const newTransaction: Transaction = {
        id: `txn-${Date.now()}`,
        accountId: data.fromAccount,
        type: 'transfer',
        description: `Payment to ${data.toAccount}`,
        amount: -data.amount,
        balance: 0, // Will be updated by backend
        status: 'pending',
        date: new Date(),
        reference: data.paymentId,
      };

      // Add to Redux store immediately for real-time feel
      dispatch(addTransaction(newTransaction) as any);

      // Refetch to get latest from backend
      fetchTransactions();
    });

    // Listen for transaction updates
    const unsubscribeUpdate = NISUM.listener('transaction:added', (data) => {
      console.log('[MFE Transactions] Transaction update event:', data);
      fetchTransactions();
    });

    return () => {
      unsubscribePayment();
      unsubscribeUpdate();
    };
  }, []);

  const fetchTransactions = async () => {
    try {
      dispatch(setTransactionsLoading(true));
      console.log(`[MFE Transactions] Fetching transactions from ${API_URL}/api/transactions`);

      const response = await axios.get(`${API_URL}/api/transactions`);
      const transactionsData = response.data;

      console.log('[MFE Transactions] Transactions fetched:', transactionsData);
      dispatch(setTransactions(transactionsData) as any);
    } catch (err) {
      console.error('[MFE Transactions] Error fetching transactions:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch transactions';
      dispatch(setTransactionsError(errorMsg));
    }
  };

  const getFilteredTransactions = () => {
    if (filter === 'all') return transactions;
    return transactions.filter((txn) => txn.type === filter);
  };

  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">📊 Transaction History</h2>
        <p className="text-gray-600 mt-2">View all your banking transactions</p>
      </div>

      {/* Real-time Update Indicator */}
      {recentPayment && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-pulse">
          <p className="text-green-800 font-semibold">✓ New payment received!</p>
          <p className="text-green-700 text-sm">Transaction list updated in real-time</p>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        <FilterButton
          label="All Transactions"
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        <FilterButton
          label="Transfers"
          active={filter === 'transfer'}
          onClick={() => setFilter('transfer')}
        />
        <FilterButton
          label="Payments"
          active={filter === 'payment'}
          onClick={() => setFilter('payment')}
        />
        <FilterButton
          label="Credits"
          active={filter === 'credit'}
          onClick={() => setFilter('credit')}
        />
        <FilterButton
          label="Debits"
          active={filter === 'debit'}
          onClick={() => setFilter('debit')}
        />
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner message="Loading transactions..." />}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-bold text-red-800">Error</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchTransactions}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Transactions List */}
      {!loading && !error && filteredTransactions.length === 0 && (
        <div className="text-center py-8 bg-gray-100 rounded-lg">
          <p className="text-gray-600">No transactions found</p>
        </div>
      )}

      {/* Transaction Table */}
      {!loading && !error && filteredTransactions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Date</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Description</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Type</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-700">Amount</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn: Transaction, index) => (
                <TransactionRow
                  key={txn.id}
                  transaction={txn}
                  isRecent={recentPayment === txn.reference}
                  isEven={index % 2 === 0}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Statistics */}
      {!loading && !error && filteredTransactions.length > 0 && (
        <TransactionStats transactions={filteredTransactions} />
      )}
    </div>
  );
};

// Filter Button Component
const FilterButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({
  label,
  active,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
      active
        ? 'bg-blue-600 text-white'
        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
    }`}
  >
    {label}
  </button>
);

// Transaction Row Component
const TransactionRow: React.FC<{
  transaction: Transaction;
  isRecent: boolean;
  isEven: boolean;
}> = ({ transaction, isRecent, isEven }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transfer':
        return '↔️';
      case 'payment':
        return '💳';
      case 'credit':
        return '➕';
      case 'debit':
        return '➖';
      default:
        return '💰';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 font-semibold';
      case 'pending':
        return 'text-yellow-600 font-semibold';
      case 'failed':
        return 'text-red-600 font-semibold';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <tr
      className={`border-b transition-colors ${
        isRecent
          ? 'bg-green-50'
          : isEven
            ? 'bg-white hover:bg-gray-50'
            : 'bg-gray-50 hover:bg-gray-100'
      }`}
    >
      <td className="px-6 py-4 text-gray-700">{formatDate(transaction.date)}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getTypeIcon(transaction.type)}</span>
          <span className="text-gray-700">{transaction.description}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-700 capitalize">{transaction.type}</td>
      <td
        className={`px-6 py-4 text-right font-bold ${
          transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
      </td>
      <td className={`px-6 py-4 capitalize ${getStatusColor(transaction.status)}`}>
        {transaction.status}
        {isRecent && ' ✨'}
      </td>
    </tr>
  );
};

// Transaction Statistics Component
const TransactionStats: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const completedCount = transactions.filter((t) => t.status === 'completed').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-green-50 border-green-200">
        <h3 className="text-sm font-semibold text-green-800">Total Income</h3>
        <p className="text-2xl font-bold text-green-600 mt-2">${totalIncome.toFixed(2)}</p>
      </Card>
      <Card className="bg-red-50 border-red-200">
        <h3 className="text-sm font-semibold text-red-800">Total Expenses</h3>
        <p className="text-2xl font-bold text-red-600 mt-2">${totalExpenses.toFixed(2)}</p>
      </Card>
      <Card className="bg-blue-50 border-blue-200">
        <h3 className="text-sm font-semibold text-blue-800">Completed</h3>
        <p className="text-2xl font-bold text-blue-600 mt-2">{completedCount} transactions</p>
      </Card>
    </div>
  );
};

export default App;
