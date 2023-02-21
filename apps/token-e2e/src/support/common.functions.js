const epochTimeout = Cypress.env('epochTimeout');
const txTimeout = Cypress.env('txTimeout');

Cypress.Commands.add(
  'convert_token_value_to_number',
  { prevSubject: true },
  (subject) => {
    return parseFloat(subject.replace(/,/g, ''));
  }
);

const navigation = {
  section: 'nav',
  vesting: '[href="/token/redeem"]',
  validators: '[href="/validators"]',
  rewards: '[href="/rewards"]',
  withdraw: '[href="/token/withdraw"]',
  proposals: '[href="/proposals"]',
  pageSpinner: '[data-testid="splash-loader"]',
  supply: '[href="/token/tranches"]',
  token: '[href="/token"]',
};

const topLevelRoutes = ['proposals', 'validators', 'rewards'];

Cypress.Commands.add('navigate_to', (page) => {
  const tokenDropDown = 'state-trigger';

  if (!topLevelRoutes.includes(page)) {
    cy.getByTestId(tokenDropDown, { timeout: 10000 }).click();
    cy.getByTestId('token-dropdown').within(() => {
      cy.get(navigation[page]).click();
    });
  } else {
    return cy.get(navigation.section, { timeout: 10000 }).within(() => {
      cy.get(navigation[page]).click();
    });
  }
});

Cypress.Commands.add('verify_tab_highlighted', (page) => {
  return cy.get(navigation.section).within(() => {
    cy.get(navigation[page]).should('have.attr', 'aria-current');
  });
});

Cypress.Commands.add('verify_page_header', (text) => {
  return cy.get('header h1').should('be.visible').and('have.text', text);
});

export function waitForSpinner() {
  cy.get(navigation.pageSpinner, Cypress.env('epochTimeout')).should('exist');
  cy.get(navigation.pageSpinner, { timeout: 20000 }).should('not.exist');
}

// This is a workaround function to begin tests with associating tokens without failing
// Should be removed when eth transaction bug is fixed
export function associateTokenStartOfTests() {
  cy.highlight(`Associating tokens for first time`);
  cy.ethereum_wallet_connect();
  cy.connectVegaWallet();
  cy.get('[href="/token/associate"]').first().click();
  cy.getByTestId('associate-radio-wallet', { timeout: 30000 }).click();
  cy.getByTestId('token-amount-input', epochTimeout).type('1');
  cy.getByTestId('token-input-submit-button', txTimeout)
    .should('be.enabled')
    .click();
  cy.contains(
    `Associating with Vega key. Waiting for ${Cypress.env(
      'blockConfirmations'
    )} more confirmations..`,
    txTimeout
  ).should('be.visible');
  cy.getByTestId('associated-amount', txTimeout).should('contain.text', '1');
  // Wait is needed to allow time for transaction to complete
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(10000);
  cy.vega_wallet_teardown();
  cy.clearLocalStorage();
}

export function verifyUnstakedBalance(amount) {
  cy.getByTestId('vega-wallet-balance-unstaked', txTimeout).should(
    'contain',
    amount,
    txTimeout
  );
}

export function verifyStakedBalance(amount) {
  cy.getByTestId('vega-wallet-balance-staked-validators', txTimeout)
    .should('contain', amount, txTimeout)
    .and('contain', '…');
}

export function verifyEthWalletTotalAssociatedBalance(amount) {
  cy.getByTestId('currency-locked', txTimeout)
    .contains(amount, txTimeout)
    .should('be.visible');
}

export function verifyEthWalletAssociatedBalance(amount) {
  cy.getByTestId('eth-wallet-associated-balances', txTimeout)
    .contains(Cypress.env('vegaWalletPublicKeyShort'), txTimeout)
    .parent(txTimeout)
    .should('contain', amount, txTimeout);
}
