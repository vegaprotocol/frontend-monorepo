/// <reference types="cypress" />

import {
  navigateTo,
  navigation,
  waitForSpinner,
} from '../../support/common.functions';
import {
  enterUniqueFreeFormProposalBody,
  goToMakeNewProposal,
} from '../../support/governance.functions';
import { vegaWalletFacetAssetsWithoutCheck } from '../../support/wallet-vega.functions';

const vegaWalletPubKey = Cypress.env('vegaWalletPublicKey2');
const vegaPubkeyTruncated = Cypress.env('vegaWalletPublicKey2Short');
const banner = 'view-banner';

context('View functionality with public key', { tags: '@smoke' }, function () {
  before('send asset to wallet', function () {
    vegaWalletFacetAssetsWithoutCheck('fUSDC', '1000000', vegaWalletPubKey);
  });

  beforeEach('visit home page', function () {
    cy.visit('/');
    waitForSpinner();
    cy.connectPublicKey(vegaWalletPubKey);
  });

  it('Able to connect public key via wallet', function () {
    verifyConnectedToPubKey();
    cy.getByTestId('currency-title', Cypress.env('epochTimeout')).should(
      'contain.text',
      'USDC (fake)'
    );
  });

  it('Able to connect public key using url', function () {
    cy.getByTestId('exit-view').click();
    cy.visit(`/?address=${vegaWalletPubKey}`);
    verifyConnectedToPubKey();
  });

  it('Unable to submit proposal with public key', function () {
    const expectedErrorTxt = `You are connected in a view only state for public key: ${vegaWalletPubKey}. In order to send transactions you must connect to a real wallet.`;

    navigateTo(navigation.proposals);
    goToMakeNewProposal('Freeform');
    enterUniqueFreeFormProposalBody('50', 'pub key proposal test');
    cy.getByTestId('dialog-content').within(() => {
      cy.get('h1').should('have.text', 'Transaction failed');
      cy.getByTestId('Error').should('have.text', expectedErrorTxt);
    });
  });

  it('Able to disconnect via banner', function () {
    cy.getByTestId('exit-view').click();
    cy.getByTestId(banner).should('not.exist');
  });

  it('Able to disconnect via wallet', function () {
    cy.getByTestId('manage-vega-wallet').click();
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
