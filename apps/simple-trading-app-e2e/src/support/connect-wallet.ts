export const connectVegaWallet = () => {
  const form = 'rest-connector-form';
  const walletName = Cypress.env('TRADING_TEST_VEGA_WALLET_NAME');
  const walletPassphrase = Cypress.env('TRADING_TEST_VEGA_WALLET_PASSPHRASE');

  cy.getByTestId('connect-vega-wallet').click();
  cy.getByTestId('connectors-list').find('button').click();
  cy.getByTestId(form).find('#wallet').click().type(walletName);
  cy.getByTestId(form).find('#passphrase').click().type(walletPassphrase);
  cy.getByTestId('rest-connector-form').find('button[type=submit]').click();
};

export const disconnectVegaWallet = () => {
  cy.getByTestId('connect-vega-wallet').click();
  cy.getByTestId('disconnect').click();
};
