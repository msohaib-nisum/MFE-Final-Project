import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import store from '@banking/state';
import App from './App';

describe('Payments MFE', () => {
  it('should render the Send Payment title', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const title = screen.getByText(/Send Payment/i);
    expect(title).toBeInTheDocument();
  });

  it('should render form labels', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const fromLabel = screen.getByText(/From Account/i);
    const toLabel = screen.getByText(/To Account/i);
    const amountLabel = screen.getByText(/Amount/i);

    expect(fromLabel).toBeInTheDocument();
    expect(toLabel).toBeInTheDocument();
    expect(amountLabel).toBeInTheDocument();
  });

  it('should render Send Payment button', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const sendButton = screen.getByRole('button', { name: /Send Payment/i });
    expect(sendButton).toBeInTheDocument();
  });
});
