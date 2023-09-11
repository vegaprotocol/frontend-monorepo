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
const closedProposals = 'closed-proposals';
const proposalStatus = 'proposal-status';
const viewProposalButton = 'view-proposal-btn';
const votesTable = 'user-vote';
const openProposals = 'open-proposals';
const majorityVoteReached = 'token-majority-met';
const minParticipationReached = 'token-participation-met';
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
      cy.mockChainId();
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
      cy.getByTestId(closedProposals).within(() => {
        cy.contains(proposalTitle)
          .parentsUntil(proposalListItem)
          .last()
          .within(() => {
            cy.getByTestId(proposalStatus).should('have.text', 'Enacted');
            cy.getByTestId(viewProposalButton).click();
          });
      });
      cy.getByTestId('proposal-type').should('have.text', 'New market');
      cy.getByTestId(proposalStatus).should('have.text', 'Enacted');
      cy.getByTestId(votesTable).within(() => {
        cy.contains('Voting has ended.').should('be.visible');
      });
    });

    // 3001-VOTE-020 3001-VOTE-021 3001-VOTE-046 3001-VOTE-044 3001-VOTE-074 3001-VOTE-074
    it('Able to enact proposal by voting', function () {
      const proposalTitle = 'Add New proposal with short enactment';
      const proposalTx = createUpdateNetworkProposalTxBody();

      cy.VegaWalletSubmitProposal(proposalTx);
      navigateTo(navigation.proposals);
      cy.reload();
      waitForSpinner();
      cy.getByTestId(openProposals).within(() => {
        cy.contains(proposalTitle)
          .parentsUntil(proposalListItem)
          .last()
          .within(() => {
            // 3001-VOTE-019 time to vote is highlighted red
            cy.getByTestId('vote-details')
              .find('span')
              .should('have.class', 'text-vega-orange');
            cy.getByTestId(viewProposalButton).click();
          });
      });
      cy.getByTestId(proposalStatus).should('have.text', 'Open');
      voteForProposal('for');
      cy.getByTestId(majorityVoteReached).should('exist');
      cy.getByTestId(minParticipationReached).should('exist');
      cy.getByTestId(proposalStatus, proposalTimeout)
        .should('have.text', 'Passed')
        .then(() => {
          cy.getByTestId(proposalStatus, proposalTimeout).should(
            'have.text',
            'Enacted'
          );
        });
      cy.getByTestId(votesTable).within(() => {
        cy.contains('Voting has ended.').should('be.visible');
      });
      cy.getByTestId('votes-for-percentage').should('have.text', '100%');
      navigateTo(navigation.proposals);
      cy.contains(proposalTitle)
        .parentsUntil(proposalListItem)
        .last()
        .within(() => {
          cy.getByTestId(majorityVoteReached).should('exist');
          cy.getByTestId(minParticipationReached).should('exist');
        });
    });

    // 3001-VOTE-047
    it('Able to enact freeform proposal', function () {
      const proposalTitle = 'Add New free form proposal with short enactment';
      const proposalTx = createFreeFormProposalTxBody();

      cy.VegaWalletSubmitProposal(proposalTx);
      navigateTo(navigation.proposals);
      cy.reload();
      waitForSpinner();
      cy.getByTestId(openProposals, { timeout: 6000 }).within(() => {
        cy.contains(proposalTitle)
          .parentsUntil(proposalListItem)
          .last()
          .within(() => cy.getByTestId(viewProposalButton).click());
      });
      cy.getByTestId(proposalStatus).should('have.text', 'Open');
      voteForProposal('for');
      cy.getByTestId(proposalStatus, proposalTimeout).should(
        'have.text',
        'Enacted'
      );
    });

    // 3001-VOTE-048 3001-VOTE-049 3001-VOTE-050
    it('Able to fail proposal due to lack of participation', function () {
      const proposalTitle = 'Add New free form proposal with short enactment';
      const proposalTx = createFreeFormProposalTxBody();
      cy.VegaWalletSubmitProposal(proposalTx);
      navigateTo(navigation.proposals);
      cy.reload();
      waitForSpinner();
      cy.getByTestId(openProposals).within(() => {
        cy.contains(proposalTitle)
          .parentsUntil(proposalListItem)
          .last()
          .within(() => cy.getByTestId(viewProposalButton).click());
      });
      cy.getByTestId(proposalStatus).should('have.text', 'Open');
      cy.getByTestId(proposalStatus, proposalTimeout).should(
        'have.text',
        'Declined'
      );
      getProposalInformationFromTable('Rejection reason')
        .contains('PROPOSAL_ERROR_PARTICIPATION_THRESHOLD_NOT_REACHED')
        .and('be.visible');
    });
  }
);
