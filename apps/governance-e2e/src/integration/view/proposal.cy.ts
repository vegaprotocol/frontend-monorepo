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

const proposalDocsLink = 'proposal-docs-link';
const proposalDocumentationLink = 'proposal-documentation-link';
const connectToVegaWalletButton = 'connect-to-vega-wallet-btn';
const governanceDocsUrl = 'https://vega.xyz/governance';
const networkUpgradeProposalListItem = 'protocol-upgrade-proposals-list-item';
const closedProposals = 'closed-proposals';
const closedProposalToggle = 'closed-proposals-toggle-networkUpgrades';

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

    // 3002-PROP-023 3004-PMAC-002 3005-PASN-002 3006-PASC-002 3007-PNEC-002 3008-PFRO-003
    it('should have button for link to more information on proposals', function () {
      const proposalsUrl = 'https://docs.vega.xyz/mainnet/tutorials/proposals';
      cy.getByTestId('new-proposal-link')
        .find('a')
        .should('have.attr', 'href', proposalsUrl);
    });

    it('should be able to see a working link for - find out more about Vega governance', function () {
      // 3001-VOTE-001
      cy.getByTestId(proposalDocumentationLink)
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

    // 3007-PNE-021
    it('should have documentation links for network parameter proposal', function () {
      goToMakeNewProposal(governanceProposalType.NETWORK_PARAMETER);
      cy.getByTestId(proposalDocsLink)
        .find('a')
        .should('have.attr', 'href')
        .and('contain', '/tutorials/proposals/network-parameter-proposal');
    });

    // 3003-PMAN-002 3003-PMAN-005
    it('should have documentation links for new market proposal', function () {
      goToMakeNewProposal(governanceProposalType.NEW_MARKET);
      cy.getByTestId(proposalDocsLink)
        .find('a')
        .should('have.attr', 'href')
        .and('contain', '/tutorials/proposals/new-market-proposal');
    });

    // 3004-PMAC-005
    it('should have documentation links for update market proposal', function () {
      goToMakeNewProposal(governanceProposalType.UPDATE_MARKET);
      cy.getByTestId(proposalDocsLink)
        .find('a')
        .should('have.attr', 'href')
        .and('contain', '/tutorials/proposals/update-market-proposal');
    });

    // 3005-PASN-002 005-PASN-005
    it('should have documentation links for new asset proposal', function () {
      goToMakeNewProposal(governanceProposalType.NEW_ASSET);
      cy.getByTestId(proposalDocsLink)
        .find('a')
        .should('have.attr', 'href')
        .and('contain', '/tutorials/proposals/new-asset-proposal');
    });

    // 3006-PASC-002 3006-PASC-005
    it('should have documentation links for update asset proposal', function () {
      goToMakeNewProposal(governanceProposalType.UPDATE_ASSET);
      cy.getByTestId(proposalDocsLink)
        .find('a')
        .should('have.attr', 'href')
        .and('contain', '/tutorials/proposals/update-asset-proposal');
    });

    // 3008-PFRO-003 3008-PFRO-017
    it('should have documentation links for freeform proposal', function () {
      goToMakeNewProposal(governanceProposalType.FREEFORM);
      cy.getByTestId(proposalDocsLink)
        .find('a')
        .should('have.attr', 'href')
        .and('contain', '/tutorials/proposals/freeform-proposal');
    });

    it('should be able to see a connect wallet button - if vega wallet disconnected and user is submitting new proposal', function () {
      goToMakeNewProposal(governanceProposalType.RAW);
      cy.getByTestId(connectToVegaWalletButton)
        .should('be.visible')
        .and('have.text', 'Connect Vega wallet');
    });

    it('should see open network upgrade proposal on homepage', function () {
      mockNetworkUpgradeProposal();
      cy.visit('/');
      cy.getByTestId('home-proposal-list').within(() => {
        cy.getByTestId(networkUpgradeProposalListItem).should('exist');
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
          .should('have.attr', 'data-testid', networkUpgradeProposalListItem)
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
      cy.getByTestId(closedProposals).within(() => {
        cy.getByTestId(networkUpgradeProposalListItem).should('not.exist');
      });
      cy.getByTestId(closedProposalToggle).click();
      cy.getByTestId(closedProposals).within(() => {
        cy.getByTestId(networkUpgradeProposalListItem).should('have.length', 1);
      });
    });

    it('should see details of network upgrade proposal', function () {
      mockNetworkUpgradeProposal();
      navigateTo(navigation.proposals);
      cy.getByTestId(networkUpgradeProposalListItem)
        .first()
        .find('[data-testid="view-proposal-btn"]')
        .click();
      cy.url().should('contain', '/protocol-upgrades/v1');
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

    it('filtering proposal should not display any network upgrade proposals', function () {
      const proposalId =
        'd848fc7881f13d366df5f61ab139d5fcfa72bf838151bb51b54381870e357931';

      mockNetworkUpgradeProposal();
      navigateTo(navigation.proposals);
      cy.get('[data-testid="proposal-filter-toggle"]').click();
      cy.get('[data-testid="filter-input"]').type(proposalId);
      cy.getByTestId(closedProposals).should('have.length', 1);
      cy.getByTestId(networkUpgradeProposalListItem).should('not.exist');
      cy.getByTestId(closedProposalToggle).should('not.exist');
    });

    it('should display network upgrade banner with estimate', function () {
      mockNetworkUpgradeProposal();
      cy.visit('/');
      cy.getByTestId('banners').within(() => {
        cy.get('div')
          .should('contain.text', 'The network will upgrade to v1 in ')
          .and(
            'contain.text',
            'Trading activity will be interrupted, manage your risk appropriately.'
          );
        cy.getByTestId('external-link')
          .should('have.attr', 'href')
          .and('contain', '/proposals/protocol-upgrade/v1');
      });

      // estimate does not display possibly due to mocks or Cypress unless the proposal is clicked on several times
      // By default the application waits for 10 blocks until showing estimate - roughly 10 seconds
      for (let i = 0; i < 3; i++) {
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(3000);
        navigateTo(navigation.proposals);
        cy.getByTestId(networkUpgradeProposalListItem)
          .first()
          .find('[data-testid="view-proposal-btn"]')
          .click();
      }
      cy.getByTestId('upgrade-proposal-estimate')
        .invoke('text')
        .as('displayedEstimate');
      cy.get('@displayedEstimate').then((estimateText) => {
        // Estimated time should automatically update every second
        cy.getByTestId('protocol-upgrade-time')
          .invoke('text')
          .should('not.eq', estimateText);
      });
    });
  }
);
