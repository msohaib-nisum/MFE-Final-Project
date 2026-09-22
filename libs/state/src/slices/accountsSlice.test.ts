import accountsReducer, {
  setAccounts,
  selectAccount,
  updateAccount,
  setLoading,
  setError,
} from './accountsSlice';

describe('Accounts Slice', () => {
  const initialState = {
    list: [],
    selected: null,
    loading: false,
    error: null,
  };

  const mockAccount = {
    id: 'acc-1',
    userId: 'user-123',
    type: 'Checking',
    balance: 5234.50,
    accountNumber: '****1234',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should return initial state', () => {
    const state = accountsReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialState);
  });

  it('should handle setAccounts', () => {
    const accounts = [mockAccount];
    const state = accountsReducer(initialState, setAccounts(accounts));

    expect(state.list).toEqual(accounts);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
  });

  it('should handle selectAccount', () => {
    const state = accountsReducer(initialState, selectAccount(mockAccount));

    expect(state.selected).toEqual(mockAccount);
  });

  it('should handle updateAccount', () => {
    const stateWithAccount = {
      ...initialState,
      list: [mockAccount],
    };

    const updatedAccount = {
      ...mockAccount,
      balance: 1000.00,
    };

    const state = accountsReducer(stateWithAccount, updateAccount(updatedAccount));

    expect(state.list[0].balance).toBe(1000.00);
  });

  it('should handle setLoading', () => {
    const state = accountsReducer(initialState, setLoading(true));

    expect(state.loading).toBe(true);
  });

  it('should handle setError', () => {
    const errorMessage = 'Failed to fetch accounts';
    const state = accountsReducer(initialState, setError(errorMessage));

    expect(state.error).toBe(errorMessage);
    expect(state.loading).toBe(false);
  });
});
