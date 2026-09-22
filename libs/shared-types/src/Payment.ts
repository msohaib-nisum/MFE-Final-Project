export interface Payment {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  reference?: string;
}
