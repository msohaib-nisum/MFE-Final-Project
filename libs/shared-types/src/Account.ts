export interface Account {
  id: string;
  userId: string;
  type: 'Checking' | 'Savings' | 'Money Market' | 'CD';
  balance: number;
  accountNumber: string;
  status: 'active' | 'inactive' | 'frozen';
  createdAt: Date;
  updatedAt: Date;
}
