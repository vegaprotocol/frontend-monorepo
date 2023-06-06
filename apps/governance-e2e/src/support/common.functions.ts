import { stakingPageDisassociateAllTokens } from './staking.functions';

const tokenDropDown = 'state-trigger';
const txTimeout = Cypress.env('txTimeout');

export enum navigation {
  section = 'nav',
  home = '[href="/"]',
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
  navigation.home,
  navigation.proposals,
  navigation.validators,
  navigation.rewards,
];

export function navigateTo(page: navigation) {
  if (!topLevelRoutes.includes(page)) {
    cy.getByTestId(tokenDropDown, { timeout: 10000 }).eq(0).click();
    cy.getByTestId('token-dropdown')
      .first()
      .within(() => {
        cy.get(page).eq(0).click();
      });
  } else {
    return cy.get(navigation.section, { timeout: 10000 }).within(() => {
      cy.get(page).eq(0).click();
    });
  }
}

export function verifyTabHighlighted(page: navigation) {
  return cy.get(navigation.section).within(() => {
    if (!topLevelRoutes.includes(page)) {
      cy.getByTestId(tokenDropDown, { timeout: 10000 }).eq(0).click();
      cy.get('[data-testid="token-dropdown"]:visible').within(() => {
        cy.get(page).should('have.attr', 'aria-current');
      });
    } else {
      cy.get(page).should('have.attr', 'aria-current');
    }
  });
}

export function verifyPageHeader(text: string) {
  return cy.get('header h1').should('be.visible').and('have.text', text);
}

export function waitForSpinner() {
  cy.get(navigation.pageSpinner, Cypress.env('epochTimeout')).should('exist');
  cy.get(navigation.pageSpinner, { timeout: 20000 }).should('not.exist');
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
    .should('contain', amount)
    .and('be.visible');
}

export function verifyEthWalletAssociatedBalance(amount: string) {
  cy.getByTestId('eth-wallet-associated-balances', txTimeout)
    .contains(Cypress.env('vegaWalletPublicKeyShort'), txTimeout)
    .parent(txTimeout)
    .should('contain', amount, txTimeout);
}

export function closeDialog() {
  cy.getByTestId('dialog-close').click();
}

export function turnTelemetryOff() {
  // Ensuring the telemetry modal doesn't disrupt the tests
  cy.window().then((win) =>
    win.localStorage.setItem('vega_telemetry_on', 'false')
  );
}

export function dissociateFromSecondWalletKey() {
  const secondWalletKey = Cypress.env('vegaWalletPublicKey2Short');
  cy.getByTestId('vega-in-wallet')
    .first()
    .within(() => {
      cy.getByTestId('eth-wallet-associated-balances')
        .last()
        .within(() => {
          cy.getByTestId('associated-key')
            .invoke('text')
            .as('associatedPubKey');
        });
    });
  cy.get('@associatedPubKey').then((associatedPubKey) => {
    if (associatedPubKey == secondWalletKey) {
      cy.get('[data-testid="manage-vega-wallet"]:visible').click();
      cy.get('[data-testid="select-keypair-button"]').eq(0).click();
      stakingPageDisassociateAllTokens();
    }
  });
}
