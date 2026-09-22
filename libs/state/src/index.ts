export { store as default, type RootState, type AppDispatch } from './store';

// User
export { setUser, clearUser } from './slices/userSlice';

// Accounts
export {
  setAccounts,
  selectAccount,
  updateAccount,
  addAccount,
  setLoading as setAccountsLoading,
  setError as setAccountsError,
} from './slices/accountsSlice';

// Transactions
export {
  setTransactions,
  addTransaction,
  updateTransaction,
  setLoading as setTransactionsLoading,
  setError as setTransactionsError,
} from './slices/transactionsSlice';

// Payments
export {
  setPayments,
  addPayment,
  updatePayment,
  setLoading as setPaymentsLoading,
  setError as setPaymentsError,
} from './slices/paymentsSlice';
