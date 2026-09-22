import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import store from '@banking/state';
import App from './App';

describe('Transactions MFE', () => {
  it('should render the Transaction History title', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const title = screen.getByText(/Transaction History/i);
    expect(title).toBeInTheDocument();
  });

  it('should render filter buttons', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const allButton = screen.getByText(/All Transactions/i);
    const transferButton = screen.getByText(/Transfers/i);

    expect(allButton).toBeInTheDocument();
    expect(transferButton).toBeInTheDocument();
  });

  it('should display loading spinner initially', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const loadingSpinner = screen.getByText(/Loading transactions/i);
    expect(loadingSpinner).toBeInTheDocument();
  });
});
