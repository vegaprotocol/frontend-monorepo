/// <reference types="cypress" />
import {
  navigateTo,
  navigation,
  turnTelemetryOff,
  waitForSpinner,
} from '../../support/common.functions';
import {
  getProposalInformationFromTable,
  voteForProposal,
} from '../../support/governance.functions';

import {
  createUpdateNetworkProposalTxBody,
  createFreeFormProposalTxBody,
} from '../../support/proposal.functions';
import { ensureSpecifiedUnstakedTokensAreAssociated } from '../../support/staking.functions';
import { ethereumWalletConnect } from '../../support/wallet-eth.functions';
import { vegaWalletSetSpecifiedApprovalAmount } from '../../support/wallet-functions';

const proposalListItem = '[data-testid="proposals-list-item"]';
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
      vegaWalletSetSpecifiedApprovalAmount('1000');
    });

    beforeEach('visit proposals', function () {
      cy.clearLocalStorage();
      turnTelemetryOff();
      cy.reload();
      waitForSpinner();
      cy.connectVegaWallet();
      ethereumWalletConnect();
      ensureSpecifiedUnstakedTokensAreAssociated('1');
      navigateTo(navigation.proposals);
    });

    // 3001-VOTE-006
    it('Able to view enacted proposal', function () {
      const proposalTitle = 'Add Lorem Ipsum market';

      cy.createMarket();
      cy.reload();
      waitForSpinner();
      cy.get(closedProposals).within(() => {
        cy.contains(proposalTitle)
          .parentsUntil(proposalListItem)
          .last()
          .within(() => {
            cy.get(proposalStatus).should('have.text', 'Enacted');
            cy.get(viewProposalButton).click();
          });
      });
      cy.getByTestId('proposal-type').should('have.text', 'New market');
      cy.get(proposalStatus).should('have.text', 'Enacted');
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
      navigateTo(navigation.proposals);
      cy.reload();
      waitForSpinner();
      cy.get(openProposals).within(() => {
        cy.contains(proposalTitle)
          .parentsUntil(proposalListItem)
          .last()
          .within(() => cy.get(viewProposalButton).click());
      });
      cy.get(proposalStatus).should('have.text', 'Open');
      voteForProposal('for');
      cy.get(proposalStatus, proposalTimeout)
        .should('have.text', 'Passed')
        .then(() => {
          cy.get(proposalStatus, proposalTimeout).should(
            'have.text',
            'Enacted'
          );
        });
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
      navigateTo(navigation.proposals);
      cy.reload();
      waitForSpinner();
      cy.get(openProposals, { timeout: 6000 }).within(() => {
        cy.contains(proposalTitle)
          .parentsUntil(proposalListItem)
          .last()
          .within(() => cy.get(viewProposalButton).click());
      });
      cy.get(proposalStatus).should('have.text', 'Open');
      voteForProposal('for');
      cy.get(proposalStatus, proposalTimeout).should('have.text', 'Enacted');
    });

    // 3001-VOTE-048 3001-VOTE-049 3001-VOTE-050
    it('Able to fail proposal due to lack of participation', function () {
      const proposalTitle = 'Add New free form proposal with short enactment';
      const proposalTx = createFreeFormProposalTxBody();
      cy.VegaWalletSubmitProposal(proposalTx);
      navigateTo(navigation.proposals);
      cy.reload();
      waitForSpinner();
      cy.get(openProposals).within(() => {
        cy.contains(proposalTitle)
          .parentsUntil(proposalListItem)
          .last()
          .within(() => cy.get(viewProposalButton).click());
      });
      cy.get(proposalStatus).should('have.text', 'Open');
      cy.get(proposalStatus, proposalTimeout).should('have.text', 'Declined');
      getProposalInformationFromTable('Rejection reason')
        .contains('PROPOSAL_ERROR_PARTICIPATION_THRESHOLD_NOT_REACHED')
        .and('be.visible');
    });
  }
);
