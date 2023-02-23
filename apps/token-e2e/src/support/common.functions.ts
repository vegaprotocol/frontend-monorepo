import { ethereumWalletConnect } from './wallet-eth.functions';
import { vegaWalletTeardown } from './wallet-teardown.functions';

const epochTimeout = Cypress.env('epochTimeout');
const txTimeout = Cypress.env('txTimeout');

export enum navigation {
  section = 'nav',
  vesting = '[href="/token/redeem"]',
  validators = '[href="/validators"]',
  rewards = '[href="/rewards"]',
  withdraw = '[href="/token/withdraw"]',
  proposals = '[href="/proposals"]',
  pageSpinner = '[data-testid="splash-loader"]',
  supply = '[href="/token/tranches"]',
  token = '[href="/token"]',
}

export function convertTokenValueToNumber(subject: string) {
  return cy.wrap(parseFloat(subject.replace(/,/g, '')));
}

const topLevelRoutes = [
  navigation.proposals,
  navigation.validators,
  navigation.rewards,
];

export function navigateTo(page: navigation) {
  const tokenDropDown = 'state-trigger';
  cy.log(page);

  if (!topLevelRoutes.includes(page)) {
    cy.getByTestId(tokenDropDown, { timeout: 10000 }).click();
    cy.getByTestId('token-dropdown').within(() => {
      cy.get(page).click();
    });
  } else {
    return cy.get(navigation.section, { timeout: 10000 }).within(() => {
      cy.get(page).click();
    });
  }
}

export function verifyTabHighlighted(page: navigation) {
  return cy.get(navigation.section).within(() => {
    cy.get(page).should('have.attr', 'aria-current');
  });
}

export function verifyPageHeader(text: string) {
  return cy.get('header h1').should('be.visible').and('have.text', text);
}

export function waitForSpinner() {
  cy.get(navigation.pageSpinner, Cypress.env('epochTimeout')).should('exist');
  cy.get(navigation.pageSpinner, { timeout: 20000 }).should('not.exist');
}

// This is a workaround function to begin tests with associating tokens without failing
// Should be removed when eth transaction bug is fixed
export function associateTokenStartOfTests() {
  cy.highlight(`Associating tokens for first time`);
  ethereumWalletConnect();
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
  vegaWalletTeardown();
  cy.clearLocalStorage();
}

export function verifyUnstakedBalance(amount: number) {
  cy.getByTestId('vega-wallet-balance-unstaked', txTimeout).should(
    'contain',
    amount,
    txTimeout
  );
}

export function verifyStakedBalance(amount: number) {
  cy.getByTestId('vega-wallet-balance-staked-validators', txTimeout)
    .should('contain', amount, txTimeout)
    .and('contain', '…');
}

export function verifyEthWalletTotalAssociatedBalance(amount: string) {
  cy.getByTestId('currency-locked', txTimeout)
    .contains(amount, txTimeout)
    .should('be.visible');
}

export function verifyEthWalletAssociatedBalance(amount: string) {
  cy.getByTestId('eth-wallet-associated-balances', txTimeout)
    .contains(Cypress.env('vegaWalletPublicKeyShort'), txTimeout)
    .parent(txTimeout)
    .should('contain', amount, txTimeout);
}
