import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import store from '@banking/state';
import App from './App';

describe('Accounts MFE', () => {
  it('should render the Accounts page title', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const title = screen.getByText(/My Accounts/i);
    expect(title).toBeInTheDocument();
  });

  it('should render the description text', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const description = screen.getByText(/View and manage your bank accounts/i);
    expect(description).toBeInTheDocument();
  });

  it('should display loading spinner on mount', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    // Loading spinner should appear initially
    const loadingSpinner = screen.getByText(/Loading your accounts/i);
    expect(loadingSpinner).toBeInTheDocument();
  });
});
