import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Payment } from '@banking/shared-types';

interface PaymentsState {
  list: Payment[];
  loading: boolean;
  error: string | null;
}

const initialState: PaymentsState = {
  list: [],
  loading: false,
  error: null,
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    setPayments: (state, action: PayloadAction<Payment[]>) => {
      state.list = action.payload;
      state.loading = false;
      state.error = null;
    },
    addPayment: (state, action: PayloadAction<Payment>) => {
      state.list.unshift(action.payload);
    },
    updatePayment: (state, action: PayloadAction<Payment>) => {
      const index = state.list.findIndex((pay) => pay.id === action.payload.id);
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
  setPayments,
  addPayment,
  updatePayment,
  setLoading,
  setError,
} = paymentsSlice.actions;
export default paymentsSlice.reducer;
