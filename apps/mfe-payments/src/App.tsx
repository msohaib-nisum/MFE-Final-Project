import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPayments, addPayment, setPaymentsLoading, setPaymentsError } from '@banking/state';
import type { RootState } from '@banking/state';
import type { Account, Payment } from '@banking/shared-types';
import { Card, Button, Input, LoadingSpinner } from '@banking/shared-ui';
import { NISUM } from '@banking/events';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { list: payments, loading } = useSelector(
    (state: RootState) => state.payments
  );
  const accounts = useSelector((state: RootState) => state.accounts.list);

  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    description: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    console.log('[MFE Payments] Component mounted');
    NISUM.emit('mfe-payments:loaded', { timestamp: new Date().toISOString() });

    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      dispatch(setPaymentsLoading(true));
      console.log(`[MFE Payments] Fetching payments from ${API_URL}/api/payments`);

      const response = await axios.get(`${API_URL}/api/payments`);
      dispatch(setPayments(response.data) as any);
    } catch (err) {
      console.error('[MFE Payments] Error fetching payments:', err);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fromAccountId) {
      errors.fromAccountId = 'Please select source account';
    }

    if (!formData.toAccountId) {
      errors.toAccountId = 'Please select destination account';
    }

    if (formData.fromAccountId === formData.toAccountId) {
      errors.toAccountId = 'Cannot pay to the same account';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
    }

    if (parseFloat(formData.amount) > 10000) {
      errors.amount = 'Amount cannot exceed $10,000';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);
    setSubmitStatus(null);

    try {
      console.log('[MFE Payments] Submitting payment...');

      const response = await axios.post(`${API_URL}/api/payments`, {
        fromAccountId: formData.fromAccountId,
        toAccountId: formData.toAccountId,
        amount: parseFloat(formData.amount),
        description: formData.description || 'Bank transfer',
      });

      const payment = response.data;
      console.log('[MFE Payments] Payment created:', payment);

      // 1. Add to local payments list
      dispatch(addPayment(payment) as any);

      // 2. Emit event to notify other MFEs
      console.log('[MFE Payments] Emitting payment:created event');
      NISUM.emit('payment:created', {
        paymentId: payment.id,
        amount: parseFloat(formData.amount),
        fromAccount: formData.fromAccountId,
        toAccount: formData.toAccountId,
        timestamp: new Date().toISOString(),
        description: formData.description,
      });

      // 3. Show success
      setSubmitStatus('success');
      setSuccessMessage(
        `Payment of $${parseFloat(formData.amount).toFixed(2)} sent successfully!`
      );

      // 4. Reset form
      setFormData({
        fromAccountId: '',
        toAccountId: '',
        amount: '',
        description: '',
      });

      // Clear success message after 4 seconds
      setTimeout(() => {
        setSubmitStatus(null);
        setSuccessMessage('');
      }, 4000);

      // Refetch payments
      fetchPayments();
    } catch (err) {
      console.error('[MFE Payments] Payment error:', err);
      setSubmitStatus('error');
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to process payment';
    }

    setSubmitLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">💳 Send Payment</h2>
        <p className="text-gray-600 mt-2">Transfer money between accounts</p>
      </div>

      {/* Payment Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800">New Payment</h3>

          {/* From Account */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              From Account
            </label>
            <select
              value={formData.fromAccountId}
              onChange={(e) =>
                setFormData({ ...formData, fromAccountId: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.fromAccountId
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            >
              <option value="">Select account...</option>
              {accounts.map((account: Account) => (
                <option key={account.id} value={account.id}>
                  {account.type} - ${account.balance.toFixed(2)} ({account.accountNumber})
                </option>
              ))}
            </select>
            {formErrors.fromAccountId && (
              <p className="text-red-600 text-sm mt-1">{formErrors.fromAccountId}</p>
            )}
          </div>

          {/* To Account */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              To Account
            </label>
            <select
              value={formData.toAccountId}
              onChange={(e) =>
                setFormData({ ...formData, toAccountId: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.toAccountId
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            >
              <option value="">Select account...</option>
              {accounts.map((account: Account) => (
                <option key={account.id} value={account.id}>
                  {account.type} - ${account.balance.toFixed(2)} ({account.accountNumber})
                </option>
              ))}
            </select>
            {formErrors.toAccountId && (
              <p className="text-red-600 text-sm mt-1">{formErrors.toAccountId}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount
            </label>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-700">$</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  formErrors.amount
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
            </div>
            {formErrors.amount && (
              <p className="text-red-600 text-sm mt-1">{formErrors.amount}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="Enter payment description..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={() => {}}
            disabled={submitLoading}
            className="w-full"
          >
            {submitLoading ? 'Processing...' : '💳 Send Payment'}
          </Button>
        </form>
      </Card>

      {/* Success Message */}
      {submitStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-pulse">
          <h3 className="font-bold text-green-800">✓ Payment Sent!</h3>
          <p className="text-green-700">{successMessage}</p>
          <p className="text-green-700 text-sm mt-1">
            Other MFEs will be notified via events in real-time!
          </p>
        </div>
      )}

      {/* Error Message */}
      {submitStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-bold text-red-800">✗ Payment Failed</h3>
          <p className="text-red-700">Unable to process payment. Please try again.</p>
        </div>
      )}

      {/* Payment History */}
      {loading ? (
        <LoadingSpinner message="Loading payment history..." />
      ) : payments.length > 0 ? (
        <PaymentHistory payments={payments} />
      ) : (
        <div className="text-center py-8 bg-gray-100 rounded-lg">
          <p className="text-gray-600">No payments made yet</p>
        </div>
      )}
    </div>
  );
};

// Payment History Component
const PaymentHistory: React.FC<{ payments: Payment[] }> = ({ payments }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Payments</h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                From
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                To
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment: Payment, index) => (
              <tr
                key={payment.id}
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="px-4 py-3 text-sm text-gray-700">
                  {formatDate(payment.createdAt)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {payment.fromAccountId}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {payment.toAccountId}
                </td>
                <td className="px-4 py-3 text-sm text-right font-bold text-red-600">
                  -${payment.amount.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      payment.status
                    )}`}
                  >
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default App;
