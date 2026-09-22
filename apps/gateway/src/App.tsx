import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '@banking/state';
import { LoadingSpinner } from '@banking/shared-ui';
import { NISUM } from '@banking/events';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

// Lazy load remote MFEs
const AccountsApp = lazy(() => import('mfeAccounts/App'));
const TransactionsApp = lazy(() => import('mfeTransactions/App'));
const PaymentsApp = lazy(() => import('mfePayments/App'));

// Fallback component for loading remote MFEs
const RemoteLoader: React.FC<{ name: string; children: React.ReactNode }> = ({ name, children }) => (
  <>
    {children}
  </>
);

// Error Boundary for handling MFE loading failures
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error) {
    console.error('Error loading remote MFE:', error);
    NISUM.emit('mfe:error', { error: error.message });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-bold text-red-800">Failed to load MFE</h2>
          <p className="text-red-700 mt-2">{this.state.error}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  useEffect(() => {
    console.log('🚀 Gateway application started');

    // Emit event when app starts
    NISUM.emit('app:started', { timestamp: new Date().toISOString() });

    // Listen for MFE errors
    const unsubscribe = NISUM.listener('mfe:error', (data) => {
      console.error('MFE Error:', data);
    });

    return unsubscribe;
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          {/* Header */}
          <Header />

          {/* Navigation */}
          <Navigation />

          {/* Main Content */}
          <main className="flex-1 container mx-auto p-6">
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner message="Loading application..." />}>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-800">
                          Welcome to Banking Platform
                        </h2>
                        <p className="text-gray-600 mt-2">
                          Select an option from the navigation menu
                        </p>
                      </div>
                    }
                  />

                  {/* Accounts MFE Route */}
                  <Route
                    path="/accounts"
                    element={
                      <RemoteLoader name="Accounts MFE">
                        <ErrorBoundary>
                          <Suspense fallback={<LoadingSpinner message="Loading Accounts..." />}>
                            <AccountsApp />
                          </Suspense>
                        </ErrorBoundary>
                      </RemoteLoader>
                    }
                  />

                  {/* Transactions MFE Route */}
                  <Route
                    path="/transactions"
                    element={
                      <RemoteLoader name="Transactions MFE">
                        <ErrorBoundary>
                          <Suspense fallback={<LoadingSpinner message="Loading Transactions..." />}>
                            <TransactionsApp />
                          </Suspense>
                        </ErrorBoundary>
                      </RemoteLoader>
                    }
                  />

                  {/* Payments MFE Route */}
                  <Route
                    path="/payments"
                    element={
                      <RemoteLoader name="Payments MFE">
                        <ErrorBoundary>
                          <Suspense fallback={<LoadingSpinner message="Loading Payments..." />}>
                            <PaymentsApp />
                          </Suspense>
                        </ErrorBoundary>
                      </RemoteLoader>
                    }
                  />

                  {/* 404 Route */}
                  <Route
                    path="*"
                    element={
                      <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-800">Page not found</h2>
                        <Link
                          to="/"
                          className="text-blue-600 hover:underline mt-4 inline-block"
                        >
                          Go back to home
                        </Link>
                      </div>
                    }
                  />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </Router>
    </Provider>
  );
};

export default App;
