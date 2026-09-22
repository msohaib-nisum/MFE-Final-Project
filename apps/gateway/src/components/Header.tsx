import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@banking/state';

const Header: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.current);

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🏦 Banking Platform</h1>
            <p className="text-blue-100 text-sm mt-1">Micro Frontend Architecture</p>
          </div>
          <div className="text-right">
            {user ? (
              <div>
                <p className="text-lg font-semibold">{user.name}</p>
                <p className="text-blue-100 text-sm">{user.email}</p>
              </div>
            ) : (
              <p className="text-blue-100">Welcome to Banking Platform</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
