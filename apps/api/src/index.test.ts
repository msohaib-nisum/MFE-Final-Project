import request from 'supertest';
import app from './index';

describe('Banking API', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });
  });

  describe('User Endpoint', () => {
    it('should return user info', async () => {
      const response = await request(app).get('/api/user');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('user-123');
      expect(response.body.name).toBe('John Doe');
      expect(response.body.email).toBe('john.doe@example.com');
    });
  });

  describe('Accounts Endpoint', () => {
    it('should return all accounts', async () => {
      const response = await request(app).get('/api/accounts');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return specific account', async () => {
      const response = await request(app).get('/api/accounts/acc-1');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('acc-1');
      expect(response.body.type).toBe('Checking');
    });

    it('should return 404 for non-existent account', async () => {
      const response = await request(app).get('/api/accounts/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Account not found');
    });
  });

  describe('Transactions Endpoint', () => {
    it('should return all transactions', async () => {
      const response = await request(app).get('/api/transactions');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Payments Endpoint', () => {
    it('should return all payments', async () => {
      const response = await request(app).get('/api/payments');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should create a payment successfully', async () => {
      const response = await request(app)
        .post('/api/payments')
        .send({
          fromAccountId: 'acc-1',
          toAccountId: 'acc-2',
          amount: 100,
          description: 'Test payment',
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.status).toBe('completed');
      expect(response.body.amount).toBe(100);
    });

    it('should reject payment to same account', async () => {
      const response = await request(app)
        .post('/api/payments')
        .send({
          fromAccountId: 'acc-1',
          toAccountId: 'acc-1',
          amount: 100,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Cannot pay to same account');
    });

    it('should reject payment with missing fields', async () => {
      const response = await request(app)
        .post('/api/payments')
        .send({
          fromAccountId: 'acc-1',
          amount: 100,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown route', async () => {
      const response = await request(app).get('/unknown-route');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not found');
    });
  });
});
