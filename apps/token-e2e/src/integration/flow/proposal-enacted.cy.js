/// <reference types="cypress" />
import { waitForSpinner } from '../../support/common.functions';
import { associateTokenStartOfTests } from '../../support/governance.functions';

import {
  createUpdateNetworkProposalTxBody,
  createFreeFormProposalTxBody,
} from '../../support/proposal.functions';

const closedProposals = '[data-testid="closed-proposals"]';
const proposalStatus = '[data-testid="proposal-status"]';
const viewProposalButton = '[data-testid="view-proposal-btn"]';
const votesTable = '[data-testid="votes-table"]';
const openProposals = '[data-testid="open-proposals"]';
const proposalVoteProgressForPercentage =
  '[data-testid="vote-progress-indicator-percentage-for"]';
const proposalTimeout = { timeout: 8000 };

context(
  'Proposal flow - with proposals enacted or failed',
  { tags: '@slow' },
  function () {
    before('Connect wallets and set approval', function () {
      cy.visit('/');
      cy.vega_wallet_set_specified_approval_amount('1000');
      associateTokenStartOfTests();
      cy.connectVegaWallet();
      cy.ethereum_wallet_connect();
      cy.ensure_specified_unstaked_tokens_are_associated(1);
      cy.clearLocalStorage();
    });

    beforeEach('visit proposals', function () {
      cy.reload();
      waitForSpinner();
      cy.connectVegaWallet();
      cy.ethereum_wallet_connect();
      cy.navigate_to('proposals');
    });

    // 3001-VOTE-006
    it('Able to view enacted proposal', function () {
      const proposalTitle = 'Add Lorem Ipsum market';

      cy.createMarket();
      cy.reload();
      waitForSpinner();
      cy.get(closedProposals).within(() => {
        cy.contains(proposalTitle)
          .parentsUntil('[data-testid="proposals-list-item"]')
          .within(() => {
            cy.get(proposalStatus).should('have.text', 'Enacted ');
            cy.get(viewProposalButton).click();
          });
      });
      cy.getByTestId('proposal-type').should('have.text', 'New market');
      cy.get_proposal_information_from_table('State')
        .contains('Enacted')
        .and('be.visible');
      cy.get(votesTable).within(() => {
        cy.contains('Vote passed.').should('be.visible');
        cy.contains('Voting has ended.').should('be.visible');
      });
    });

    // 3001-VOTE-046 3001-VOTE-044 3001-VOTE-074 3001-VOTE-074
    it('Able to enact proposal by voting', function () {
      const proposalTitle = 'Add New proposal with short enactment';
      const proposalTx = createUpdateNetworkProposalTxBody();

      cy.VegaWalletSubmitProposal(proposalTx);
      cy.navigate_to('proposals');
      cy.reload();
      waitForSpinner();
      cy.get(openProposals).within(() => {
        cy.contains(proposalTitle)
          .parentsUntil('[data-testid="proposals-list-item"]')
          .within(() => cy.get(viewProposalButton).click());
      });
      cy.get_proposal_information_from_table('State')
        .contains('Open')
        .and('be.visible');
      cy.vote_for_proposal('for');
      cy.get_proposal_information_from_table('State') // 3001-VOTE-047
        .contains('Passed', proposalTimeout)
        .and('be.visible');
      cy.get_proposal_information_from_table('State')
        .contains('Enacted', proposalTimeout)
        .and('be.visible');
      cy.get(votesTable).within(() => {
        cy.contains('Vote passed.').should('be.visible');
        cy.contains('Voting has ended.').should('be.visible');
      });
      cy.get(proposalVoteProgressForPercentage)
        .contains('100.00%')
        .and('be.visible');
    });

    // 3001-VOTE-047
    it('Able to enact freeform proposal', function () {
      const proposalTitle = 'Add New free form proposal with short enactment';
      const proposalTx = createFreeFormProposalTxBody();

      cy.VegaWalletSubmitProposal(proposalTx);
      cy.navigate_to('proposals');
      cy.reload();
      waitForSpinner();
      cy.get(openProposals).within(() => {
        cy.contains(proposalTitle)
          .parentsUntil('[data-testid="proposals-list-item"]')
          .within(() => cy.get(viewProposalButton).click());
      });
      cy.get_proposal_information_from_table('State')
        .contains('Open')
        .and('be.visible');
      cy.vote_for_proposal('for');
      cy.get_proposal_information_from_table('State')
        .contains('Enacted', proposalTimeout)
        .and('be.visible');
    });

    // 3001-VOTE-048 3001-VOTE-049
    it('Able to fail proposal due to lack of participation', function () {
      const proposalTitle = 'Add New free form proposal with short enactment';
      const proposalTx = createFreeFormProposalTxBody();
      cy.VegaWalletSubmitProposal(proposalTx);
      cy.navigate_to('proposals');
      cy.reload();
      waitForSpinner();
      cy.get(openProposals).within(() => {
        cy.contains(proposalTitle)
          .parentsUntil('[data-testid="proposals-list-item"]')
          .within(() => cy.get(viewProposalButton).click());
      });
      cy.get_proposal_information_from_table('State')
        .contains('Open')
        .and('be.visible');
      cy.get_proposal_information_from_table('State') // 3001-VOTE-047
        .contains('Declined', proposalTimeout)
        .and('be.visible');
      cy.get_proposal_information_from_table('Rejection reason')
        .contains('PROPOSAL_ERROR_PARTICIPATION_THRESHOLD_NOT_REACHED')
        .and('be.visible');
    });
  }
);
