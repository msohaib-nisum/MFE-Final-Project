import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAccounts, setAccountsLoading, setAccountsError } from '@banking/state';
import type { RootState } from '@banking/state';
import type { Account } from '@banking/shared-types';
import { Card, LoadingSpinner } from '@banking/shared-ui';
import { NISUM } from '@banking/events';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { list: accounts, loading, error } = useSelector(
    (state: RootState) => state.accounts
  );

  useEffect(() => {
    console.log('[MFE Accounts] Component mounted');
    NISUM.emit('mfe-accounts:loaded', { timestamp: new Date().toISOString() });

    fetchAccounts();

    // Listen for account update events
    const unsubscribe = NISUM.listener('account:updated', (data) => {
      console.log('[MFE Accounts] Account updated event received:', data);
      // Refetch accounts when update event received
      fetchAccounts();
    });

    return unsubscribe;
  }, []);

  const fetchAccounts = async () => {
    try {
      dispatch(setAccountsLoading(true));
      console.log(`[MFE Accounts] Fetching accounts from ${API_URL}/api/accounts`);

      const response = await axios.get(`${API_URL}/api/accounts`);
      const accountsData = response.data;

      console.log('[MFE Accounts] Accounts fetched:', accountsData);
      dispatch(setAccounts(accountsData) as any);
    } catch (err) {
      console.error('[MFE Accounts] Error fetching accounts:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch accounts';
      dispatch(setAccountsError(errorMsg));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">👤 My Accounts</h2>
        <p className="text-gray-600 mt-2">View and manage your bank accounts</p>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner message="Loading your accounts..." />}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-bold text-red-800">Error</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchAccounts}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Accounts List */}
      {!loading && !error && accounts.length === 0 && (
        <div className="text-center py-8 bg-gray-100 rounded-lg">
          <p className="text-gray-600">No accounts found</p>
        </div>
      )}

      {!loading && !error && accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts.map((account: Account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}

      {/* Total Summary */}
      {!loading && !error && accounts.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white mt-6">
          <div>
            <h3 className="text-lg font-semibold">Total Balance</h3>
            <p className="text-4xl font-bold mt-2">
              ${accounts.reduce((sum, acc) => sum + acc.balance, 0).toFixed(2)}
            </p>
            <p className="text-blue-100 mt-1">Across {accounts.length} accounts</p>
          </div>
        </Card>
      )}
    </div>
  );
};

// Account Card Component
const AccountCard: React.FC<{ account: Account }> = ({ account }) => {
  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'Checking':
        return '💳';
      case 'Savings':
        return '🏦';
      case 'Money Market':
        return '💰';
      case 'CD':
        return '📊';
      default:
        return '💼';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'frozen':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getAccountIcon(account.type)}</span>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{account.type} Account</h3>
            <p className="text-gray-600 text-sm">Account: {account.accountNumber}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(account.status)}`}>
          {account.status}
        </span>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Balance</span>
          <span className="text-2xl font-bold text-green-600">
            ${account.balance.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          View Details
        </button>
        <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
          Transfer
        </button>
      </div>
    </Card>
  );
};

export default App;
