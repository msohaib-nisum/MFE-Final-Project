export interface Transaction {
  id: string;
  accountId: string;
  type: 'debit' | 'credit' | 'transfer' | 'payment';
  description: string;
  amount: number;
  balance: number;
  status: 'completed' | 'pending' | 'failed';
  date: Date;
  reference?: string;
}
