/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './apps/gateway/src/**/*.{ts,tsx}',
    './apps/mfe-accounts/src/**/*.{ts,tsx}',
    './apps/mfe-transactions/src/**/*.{ts,tsx}',
    './apps/mfe-payments/src/**/*.{ts,tsx}',
    './libs/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
