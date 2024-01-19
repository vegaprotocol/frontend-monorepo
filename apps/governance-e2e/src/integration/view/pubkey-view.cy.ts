/// <reference types="cypress" />

import {
  turnTelemetryOff,
  waitForSpinner,
} from '../../support/common.functions';
import {
  createTenDigitUnixTimeStampForSpecifiedDays,
  enterRawProposalBody,
  goToMakeNewProposal,
  governanceProposalType,
} from '../../support/governance.functions';
import { vegaWalletFaucetAssetsWithoutCheck } from '../../support/wallet-functions';

const vegaWalletPubKey = Cypress.env('vegaWalletPublicKey2');
const vegaPubkeyTruncated = Cypress.env('vegaWalletPublicKey2Short');
const banner = 'view-banner';

context('View functionality with public key', { tags: '@smoke' }, function () {
  before('send asset to wallet', function () {
    vegaWalletFaucetAssetsWithoutCheck(
      '816af99af60d684502a40824758f6b5377e6af48e50a9ee8ef478ecb879ea8bc',
      '1000000',
      vegaWalletPubKey
    );
  });

  // @ts-ignore clash between jest and cypress
  beforeEach('visit home page', function () {
    cy.clearLocalStorage();
    turnTelemetryOff();
    cy.visit('/');
    waitForSpinner();
    cy.connectPublicKey(vegaWalletPubKey);
  });

  it('Able to connect public key using url', function () {
    cy.getByTestId('exit-view').click();
    cy.visit(`/?address=${vegaWalletPubKey}`);
    verifyConnectedToPubKey();
  });

  it('Able to connect public key via wallet and view assets in wallet', function () {
    verifyConnectedToPubKey();
    cy.getByTestId('currency-title', { timeout: 10000 })
      .should('have.length.at.least', 4)
      .and('contain.text', 'USDC (fake)');
  });

  it.skip('Unable to submit proposal with public key', function () {
    const expectedErrorTxt = `You are connected in a view only state for public key: ${vegaWalletPubKey}. In order to send transactions you must connect to a real wallet.`;

    goToMakeNewProposal(governanceProposalType.RAW);
    enterRawProposalBody(createTenDigitUnixTimeStampForSpecifiedDays(8));
    cy.getByTestId('dialog-content')
      .first()
      .within(() => {
        cy.get('h1').should('have.text', 'Transaction failed');
        cy.getByTestId('Error').should('have.text', expectedErrorTxt);
      });
  });

  it('Able to disconnect via banner', function () {
    cy.getByTestId('exit-view').click();
    cy.getByTestId(banner).should('not.exist');
  });

  it('Able to disconnect via wallet', function () {
    cy.get('aside [data-testid="manage-vega-wallet"]').click();
    cy.getByTestId('disconnect').click();
    cy.getByTestId(banner).should('not.exist');
  });

  function verifyConnectedToPubKey() {
    cy.getByTestId(banner).should(
      'contain.text',
      `Viewing as Vega user: ${vegaPubkeyTruncated}`
    );
  }
});
