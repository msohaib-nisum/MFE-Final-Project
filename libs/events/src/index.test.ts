import { NISUM } from './index';

describe('NISUM Event System', () => {
  beforeEach(() => {
    // Clear all listeners before each test
    NISUM.clear('payment:created');
    NISUM.clear('transaction:added');
  });

  it('should emit and receive events', (done) => {
    NISUM.listener('test:event', (data) => {
      expect(data.message).toBe('Hello World');
      done();
    });

    NISUM.emit('test:event', { message: 'Hello World' });
  });

  it('should handle payment:created event', (done) => {
    NISUM.listener('payment:created', (data) => {
      expect(data.paymentId).toBe('pay-123');
      expect(data.amount).toBe(150);
      done();
    });

    NISUM.emit('payment:created', {
      paymentId: 'pay-123',
      amount: 150,
      fromAccount: 'acc-1',
      toAccount: 'acc-2',
    });
  });

  it('should allow unsubscribing from events', () => {
    const handler = jest.fn();
    const unsubscribe = NISUM.listener('test:event', handler);

    NISUM.emit('test:event', { data: 'test' });
    expect(handler).toHaveBeenCalledTimes(1);

    unsubscribe();
    NISUM.emit('test:event', { data: 'test' });
    expect(handler).toHaveBeenCalledTimes(1); // Still 1, not called again
  });

  it('should return listener count', () => {
    NISUM.listener('test:event', () => {});
    NISUM.listener('test:event', () => {});

    const count = NISUM.listenerCount('test:event');
    expect(count).toBe(2);
  });

  it('should support multiple listeners for same event', (done) => {
    let callCount = 0;

    NISUM.listener('multi:event', () => {
      callCount++;
      if (callCount === 2) {
        done();
      }
    });

    NISUM.listener('multi:event', () => {
      callCount++;
      if (callCount === 2) {
        done();
      }
    });

    NISUM.emit('multi:event', { data: 'test' });
  });
});
