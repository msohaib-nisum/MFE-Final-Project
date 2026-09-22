import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Account } from '@banking/shared-types';

interface AccountsState {
  list: Account[];
  selected: Account | null;
  loading: boolean;
  error: string | null;
}

const initialState: AccountsState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
};

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    setAccounts: (state, action: PayloadAction<Account[]>) => {
      state.list = action.payload;
      state.loading = false;
      state.error = null;
    },
    selectAccount: (state, action: PayloadAction<Account>) => {
      state.selected = action.payload;
    },
    updateAccount: (state, action: PayloadAction<Account>) => {
      const index = state.list.findIndex((acc) => acc.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
      if (state.selected?.id === action.payload.id) {
        state.selected = action.payload;
      }
    },
    addAccount: (state, action: PayloadAction<Account>) => {
      state.list.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setAccounts,
  selectAccount,
  updateAccount,
  addAccount,
  setLoading,
  setError,
} = accountsSlice.actions;
export default accountsSlice.reducer;
