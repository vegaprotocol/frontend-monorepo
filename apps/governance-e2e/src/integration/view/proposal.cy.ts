import {
  navigateTo,
  navigation,
  verifyPageHeader,
  verifyTabHighlighted,
  waitForSpinner,
} from '../../support/common.functions';

const proposalDocumentationLink = '[data-testid="proposal-documentation-link"]';
const newProposalButton = '[data-testid="new-proposal-link"]';
const newProposalLink = '[data-testid="new-proposal-link"]';
const governanceDocsUrl = 'https://vega.xyz/governance';
const connectToVegaWalletButton = '[data-testid="connect-to-vega-wallet-btn"]';

context(
  'Governance Page - verify elements on page',
  { tags: '@smoke' },
  function () {
    before('navigate to governance page', function () {
      cy.visit('/');
      navigateTo(navigation.proposals);
    });

    describe('with no network change proposals', function () {
      it('should have governance tab highlighted', function () {
        verifyTabHighlighted(navigation.proposals);
      });

      it('should have GOVERNANCE header visible', function () {
        verifyPageHeader('Proposals');
      });

      it('should be able to see a working link for - find out more about Vega governance', function () {
        // 3001-VOTE-001
        cy.get(proposalDocumentationLink)
          .should('be.visible')
          .and('have.text', 'Find out more about Vega governance')
          .and('have.attr', 'href')
          .and('equal', governanceDocsUrl);

        // 3002-PROP-001
        cy.request(governanceDocsUrl)
          .its('body')
          .then((body) => {
            if (!body.includes('Govern the network')) {
              assert.include(
                body,
                'Govern the network',
                `Checking that governance link destination includes 'Govern the network' text`
              );
            }
          });
      });

      it('should be able to see button for - new proposal', function () {
        // 3001-VOTE-002
        cy.get(newProposalLink)
          .should('be.visible')
          .and('have.text', 'New proposal')
          .and('have.attr', 'href')
          .and('equal', '/proposals/propose');
      });

      // Skipping this test for now, the new proposal button no longer takes a user directly
      // to a proposal form, instead it takes them to a page where they can select a proposal type.
      // Keeping this test here for now as it can be repurposed to test the new proposal forms.
      it.skip('should be able to see a connect wallet button - if vega wallet disconnected and new proposal button selected', function () {
        cy.get(newProposalButton).should('be.visible').click();
        cy.get(connectToVegaWalletButton)
          .should('be.visible')
          .and('have.text', 'Connect Vega wallet');
        navigateTo(navigation.proposals);
        waitForSpinner();
      });
    });
  }
);
