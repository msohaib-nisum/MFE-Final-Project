import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white mt-8">
      <div className="container mx-auto px-6 py-6 text-center">
        <p className="text-gray-400">
          © 2026 Banking Platform. Built with Micro Frontends & Module Federation.
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Accounts • Transactions • Payments
        </p>
      </div>
    </footer>
  );
};

export default Footer;
