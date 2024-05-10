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
const proposalUpgradeBlockHeight = 'protocol-upgrade-proposal-block-height';
const listItems = 'proposal-list-items';
const protocolUpgradeTime = 'protocol-upgrade-time';

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
    // need capsule update - 76.preview.5
    it.skip('should have GOVERNANCE header visible', function () {
      verifyPageHeader('Proposals');
    });
    // need capsule update - 76.preview.5
    // 3002-PROP-023 3004-PMAC-002 3005-PASN-002 3006-PASC-002 3007-PNEC-002 3008-PFRO-003
    it.skip('new proposal page should have button for link to more information on proposals', function () {
      cy.getByTestId('new-proposal-link').click();
      cy.url().should('include', '/proposals/propose/raw');
      cy.contains('To see Explorer data on proposals visit').within(() => {
        cy.getByTestId('external-link').should(
          'have.attr',
          'href',
          'https://explorer.fairground.wtf/governance'
        );
      });
      cy.contains(
        '1. Sense check your proposal with the community on the forum:'
      ).within(() => {
        cy.getByTestId('external-link').should(
          'have.attr',
          'href',
          'https://community.vega.xyz/c/governance/25'
        );
      });
      cy.contains(
        '2. Use the appropriate proposal template in the docs:'
      ).within(() => {
        cy.getByTestId('external-link').should(
          'have.attr',
          'href',
          'https://docs.vega.xyz/mainnet/tutorials/proposals'
        );
      });
      cy.contains('Connect your wallet to submit a proposal').should(
        'be.visible'
      );
      cy.getByTestId('connect-to-vega-wallet-btn').should('exist');
      navigateTo(navigation.proposals);
    });
    // need capsule update - 76.preview.5
    it.skip('should be able to see a working link for - find out more about Vega governance', function () {
      // 3001-VOTE-001  // 3002-PROP-001
      cy.getByTestId(proposalDocumentationLink)
        .should('be.visible')
        .and('have.text', 'Find out more about Vega governance')
        .and('have.attr', 'href')
        .and('equal', governanceDocsUrl);
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
      cy.getByTestId(listItems).within(() => {
        cy.getByTestId(networkUpgradeProposalListItem).should('have.length', 3);
        cy.getByTestId(networkUpgradeProposalListItem)
          .first()
          .within(() => {
            cy.get('h2').should('have.text', 'Vega release v1');
            cy.getByTestId('protocol-upgrade-proposal-type').should(
              'contain.text',
              'Network Upgrade'
            );
            cy.getByTestId('protocol-upgrade-proposal-release-tag').should(
              'have.text',
              'Vega release tag: v1'
            );
            cy.getByTestId(proposalUpgradeBlockHeight).should(
              'contain.text',
              'Upgrade block height: 2015942'
            );
            cy.getByTestId('protocol-upgrade-proposal-status').should(
              'have.text',
              'Approved by validators'
            );
          });
      });
    });

    // 3009-NTWU-003 3009-NTWU-004 3009-NTWU-007
    it('should see details of network upgrade proposal', function () {
      mockNetworkUpgradeProposal();
      navigateTo(navigation.proposals);
      cy.getByTestId(networkUpgradeProposalListItem)
        .first()
        .find('[data-testid="view-proposal-btn"]')
        .click();
      cy.url().should('contain', '/protocol-upgrades/v1/2015942');
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

    // 3009-NTWU-001 3009-NTWU-002 3009-NTWU-006 3009-NTWU-009
    it.skip('should display network upgrade banner with estimate', function () {
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
          .and('contain', '/proposals/protocol-upgrade/v1/2015942');
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
        cy.getByTestId(protocolUpgradeTime)
          .invoke('text')
          .should('not.eq', estimateText);
      });
      // time estimate on proposal detail
      cy.getByTestId('protocol-upgrade-proposal').within(() => {
        cy.get('@displayedEstimate').then((estimateText) => {
          cy.getByTestId(protocolUpgradeTime)
            .invoke('text')
            .should('not.eq', estimateText);
        });
      });
    });
  }
);
