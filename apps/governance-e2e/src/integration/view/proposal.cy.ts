import {
  navigateTo,
  navigation,
  verifyPageHeader,
  verifyTabHighlighted,
} from '../../support/common.functions';
import {
  goToMakeNewProposal,
  governanceProposalType,
} from '../../support/governance.functions';
import { mockNetworkUpgradeProposal } from '../../support/proposal.functions';

const proposalDocumentationLink = '[data-testid="proposal-documentation-link"]';
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

    it.skip('should be able to see button for - new proposal', function () {
      // 3001-VOTE-002
      cy.get(newProposalLink)
        .should('be.visible')
        .and('have.text', 'New proposal')
        .and('have.attr', 'href')
        .and('equal', '/proposals/propose');
    });

    it.skip('should be able to see a connect wallet button - if vega wallet disconnected and user is submitting new proposal', function () {
      goToMakeNewProposal(governanceProposalType.NETWORK_PARAMETER);
      cy.get(connectToVegaWalletButton)
        .should('be.visible')
        .and('have.text', 'Connect Vega wallet');
    });

    it('should see open network upgrade proposal on homepage', function () {
      mockNetworkUpgradeProposal();
      cy.visit('/');
      cy.getByTestId('home-proposal-list').within(() => {
        cy.getByTestId('protocol-upgrade-proposals-list-item').should('exist');
        cy.getByTestId('protocol-upgrade-proposal-title').should(
          'have.text',
          'Vega release v1'
        );
      });
    });

    it('should see network upgrade proposals in proposals list', function () {
      mockNetworkUpgradeProposal();
      navigateTo(navigation.proposals);
      cy.getByTestId('open-proposals').within(() => {
        cy.get('li')
          .eq(0)
          .should(
            'have.attr',
            'data-testid',
            'protocol-upgrade-proposals-list-item'
          )
          .within(() => {
            cy.get('h2').should('have.text', 'Vega release v1');
            cy.getByTestId('protocol-upgrade-proposal-type').should(
              'have.text',
              'Network Upgrade'
            );
            cy.getByTestId('protocol-upgrade-proposal-release-tag').should(
              'have.text',
              'Vega release tag: v1'
            );
            cy.getByTestId('protocol-upgrade-proposal-block-height').should(
              'have.text',
              'Upgrade block height: 2015942'
            );
            cy.getByTestId('protocol-upgrade-proposal-status').should(
              'have.text',
              'Approved by validators '
            );
          });
      });
      cy.getByTestId('closed-proposals').within(() => {
        cy.getByTestId('protocol-upgrade-proposals-list-item').should(
          'have.length',
          1
        );
      });
    });

    it('should see details of network upgrade proposal', function () {
      mockNetworkUpgradeProposal();
      navigateTo(navigation.proposals);
      cy.getByTestId('protocol-upgrade-proposals-list-item')
        .first()
        .find('[data-testid="view-proposal-btn"]')
        .click();
      cy.getByTestId('protocol-upgrade-proposal').within(() => {
        cy.get('h1').should('have.text', 'Vega Release v1');
        cy.getByTestId('protocol-upgrade-block-height').should(
          'have.text',
          '2015942 (currently 2014133)'
        );
        cy.getByTestId('protocol-upgrade-state').should(
          'have.text',
          'Approved by validators'
        );
        cy.getByTestId('protocol-upgrade-release-tag').should(
          'have.text',
          'v1'
        );
        cy.getByTestId('protocol-upgrade-approval-status')
          .should('contain.text', '99.98% approval (% validator voting power)')
          .and('contain.text', '(67% voting power required)');
        cy.get('h2').should('contain.text', 'Approvers (4/4 validators)');
        cy.getByTestId('validator-name')
          .should('have.length', 4)
          .each(($validator) => {
            cy.wrap($validator).find('a').should('have.attr', 'href');
          });
        cy.getByTestId('validator-voting-power').each(
          ($validatorVotingPower) => {
            cy.wrap($validatorVotingPower)
              .invoke('text')
              .should('contain', '%');
          }
        );
      });
    });
  }
);
