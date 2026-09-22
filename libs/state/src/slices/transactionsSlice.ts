import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Transaction } from '@banking/shared-types';

interface TransactionsState {
  list: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  list: [],
  loading: false,
  error: null,
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.list = action.payload;
      state.loading = false;
      state.error = null;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.list.unshift(action.payload);
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.list.findIndex((txn) => txn.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
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
  setTransactions,
  addTransaction,
  updateTransaction,
  setLoading,
  setError,
} = transactionsSlice.actions;
export default transactionsSlice.reducer;
