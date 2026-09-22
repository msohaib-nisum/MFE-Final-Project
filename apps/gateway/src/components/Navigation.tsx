import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-700' : 'hover:bg-blue-500';
  };

  return (
    <nav className="bg-blue-600">
      <div className="container mx-auto px-6">
        <div className="flex space-x-4 py-0">
          <Link
            to="/"
            className={`px-6 py-3 text-white font-medium transition-colors ${isActive(
              '/'
            )}`}
          >
            Home
          </Link>
          <Link
            to="/accounts"
            className={`px-6 py-3 text-white font-medium transition-colors ${isActive(
              '/accounts'
            )}`}
          >
            👤 Accounts
          </Link>
          <Link
            to="/transactions"
            className={`px-6 py-3 text-white font-medium transition-colors ${isActive(
              '/transactions'
            )}`}
          >
            📊 Transactions
          </Link>
          <Link
            to="/payments"
            className={`px-6 py-3 text-white font-medium transition-colors ${isActive(
              '/payments'
            )}`}
          >
            💳 Payments
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
