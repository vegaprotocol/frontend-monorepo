/// <reference types="cypress" />
import {
  createRawProposal,
  createTenDigitUnixTimeStampForSpecifiedDays,
  enterRawProposalBody,
  enterUniqueFreeFormProposalBody,
  generateFreeFormProposalTitle,
  getProposalFromTitle,
  getProposalInformationFromTable,
  goToMakeNewProposal,
  governanceProposalType,
  submitUniqueRawProposal,
  voteForProposal,
  waitForProposalSync,
} from '../../support/governance.functions';

import {
  verifyUnstakedBalance,
  waitForSpinner,
  navigateTo,
  navigation,
  closeDialog,
  turnTelemetryOff,
} from '../../support/common.functions';
import {
  clickOnValidatorFromList,
  closeStakingDialog,
  ensureSpecifiedUnstakedTokensAreAssociated,
  stakingPageDisassociateTokens,
  stakingValidatorPageAddStake,
} from '../../support/staking.functions';
import {
  vegaWalletSetSpecifiedApprovalAmount,
  vegaWalletTeardown,
} from '../../support/wallet-functions';
import { ethereumWalletConnect } from '../../support/wallet-eth.functions';
import type { testFreeformProposal } from '../../support/common-interfaces';

const vegaWalletStakedBalances =
  '[data-testid="vega-wallet-balance-staked-validators"]';
const vegaWalletAssociatedBalance = '[data-testid="associated-amount"]';
const vegaWalletNameElement = '[data-testid="wallet-name"]';
const vegaWallet = '[data-testid="vega-wallet"]';
const connectToVegaWalletButton = '[data-testid="connect-to-vega-wallet-btn"]';
const newProposalSubmitButton = '[data-testid="proposal-submit"]';
const viewProposalButton = '[data-testid="view-proposal-btn"]';
const rawProposalData = '[data-testid="proposal-data"]';
const voteButtons = '[data-testid="vote-buttons"]';
const rejectProposalsLink = '[href="/proposals/rejected"]';
const feedbackError = '[data-testid="Error"]';
const noOpenProposals = '[data-testid="no-open-proposals"]';
const noClosedProposals = '[data-testid="no-closed-proposals"]';
const txTimeout = Cypress.env('txTimeout');
const epochTimeout = Cypress.env('epochTimeout');
const proposalTimeout = { timeout: 14000 };

context(
  'Governance flow - with eth and vega wallets connected',
  { tags: '@slow' },
  function () {
    before('connect wallets and set approval limit', function () {
      cy.visit('/');
      cy.get_network_parameters().then((network_parameters) => {
        cy.wrap(
          Number(network_parameters['spam.protection.proposal.min.tokens']) /
            1000000000000000000
        ).as('minProposerBalance');
        cy.wrap(
          Number(network_parameters['spam.protection.voting.min.tokens']) /
            1000000000000000000
        ).as('minVoterBalance');
        cy.wrap(
          Number(
            network_parameters['governance.proposal.freeform.requiredMajority']
          ) * 100
        ).as('requiredMajority');
      });

      vegaWalletSetSpecifiedApprovalAmount('1000');
    });

    beforeEach('visit governance tab', function () {
      cy.clearLocalStorage();
      turnTelemetryOff();
      cy.reload();
      waitForSpinner();
      cy.connectVegaWallet();
      ethereumWalletConnect();
      ensureSpecifiedUnstakedTokensAreAssociated('1');
      navigateTo(navigation.proposals);
    });

    // Test can only pass if run before other proposal tests.
    it.skip('Should be able to see that no proposals exist', function () {
      // 3001-VOTE-003
      cy.get(noOpenProposals)
        .should('be.visible')
        .and('have.text', 'There are no open or yet to enact proposals');
      cy.get(noClosedProposals)
        .should('be.visible')
        .and('have.text', 'There are no enacted or rejected proposals');
    });

    // 3002-PROP-002 3002-PROP-003 3001-VOTE-012 3007-PNE-020 3004-PMAC-004 3005-PASN-004 3008-PFRO-016 3003-PMAN-004
    it('Proposal form - shows how many vega tokens are required to make a proposal', function () {
      // 3002-PROP-005
      goToMakeNewProposal(governanceProposalType.NEW_MARKET);
      cy.contains(
        `You must have at least 1 VEGA associated to make a proposal`
      ).should('be.visible');
    });

    // 3002-PROP-011 3008-PFRO-005
    it('Able to submit a valid freeform proposal - with minimum required tokens associated', function () {
      ensureSpecifiedUnstakedTokensAreAssociated('1');
      verifyUnstakedBalance(1);
      createRawProposal();
    });

    // 3008-PFRO-002 3008-PFRO-004
    it('Able to submit a valid freeform proposal - with minimum required tokens associated - but also staked', function () {
      ensureSpecifiedUnstakedTokensAreAssociated('2');
      verifyUnstakedBalance(2);
      navigateTo(navigation.validators);
      clickOnValidatorFromList(0);
      stakingValidatorPageAddStake('2');
      closeStakingDialog();

      cy.get(vegaWalletStakedBalances, txTimeout).should('contain', '2');
      createRawProposal();
    });

    it.skip('Creating a proposal - proposal rejected - when closing time sooner than system default', function () {
      goToMakeNewProposal(governanceProposalType.FREEFORM);
      enterUniqueFreeFormProposalBody('0.1', generateFreeFormProposalTitle());
      cy.get('input:invalid')
        .invoke('prop', 'validationMessage')
        .should('equal', 'Value must be greater than or equal to 1.');
    });

    it.skip('Creating a proposal - proposal rejected - when closing time later than system default', function () {
      goToMakeNewProposal(governanceProposalType.FREEFORM);
      enterUniqueFreeFormProposalBody(
        '100000',
        generateFreeFormProposalTitle()
      );
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'not.exist'
      );
      cy.get('input:invalid')
        .invoke('prop', 'validationMessage')
        .should('equal', 'Value must be less than or equal to 8760.');
    });

    // 3001-VOTE-006
    it('Creating a proposal - proposal rejected - able to access rejected proposals', function () {
      goToMakeNewProposal(governanceProposalType.RAW);
      enterRawProposalBody(createTenDigitUnixTimeStampForSpecifiedDays(1000));
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Proposal rejected', proposalTimeout).should('be.visible');
      closeDialog();
      waitForProposalSync();
      navigateTo(navigation.proposals);
      cy.get(rejectProposalsLink).click();
      cy.get<testFreeformProposal>('@rawProposal').then((rawProposal) => {
        getProposalFromTitle(rawProposal.rationale.title).within(() => {
          cy.contains('Rejected').should('be.visible');
          cy.contains('Close time too late').should('be.visible');
          cy.get(viewProposalButton).click();
        });
      });
      cy.getByTestId('proposal-status').should('have.text', 'Rejected');
      getProposalInformationFromTable('Rejection reason')
        .contains('PROPOSAL_ERROR_CLOSE_TIME_TOO_LATE')
        .and('be.visible');
      getProposalInformationFromTable('Error details')
        .contains('proposal closing time too late')
        .and('be.visible');
    });

    // 0005-ETXN-004
    it('Unable to create a proposal - when no tokens are associated', function () {
      const errorMsg =
        'Network error: the network blocked the transaction through the spam protection: party has insufficient associated governance tokens in their staking account to submit proposal request (ABCI code 89)';
      vegaWalletTeardown();
      cy.get(vegaWalletAssociatedBalance, txTimeout).contains(
        '0.00',
        txTimeout
      );
      goToMakeNewProposal(governanceProposalType.RAW);
      enterRawProposalBody(createTenDigitUnixTimeStampForSpecifiedDays(8));
      cy.contains('Transaction failed', proposalTimeout).should('be.visible');
      cy.get(feedbackError).should('have.text', errorMsg);
      closeDialog();
    });

    // 3002-PROP-009
    it('Unable to create a proposal - when some but not enough tokens are associated', function () {
      const errorMsg =
        'Network error: the network blocked the transaction through the spam protection: party has insufficient associated governance tokens in their staking account to submit proposal request (ABCI code 89)';

      ensureSpecifiedUnstakedTokensAreAssociated('0.000001');
      goToMakeNewProposal(governanceProposalType.RAW);
      enterRawProposalBody(createTenDigitUnixTimeStampForSpecifiedDays(8));
      cy.contains('Transaction failed', proposalTimeout).should('be.visible');
      cy.get(feedbackError).should('have.text', errorMsg);
      closeDialog();
    });

    it('Unable to create a freeform proposal - when json parent section contains unexpected field', function () {
      const errorMsg =
        'Invalid params: the transaction does not use a valid Vega command: unknown field "unexpected" in vega.commands.v1.ProposalSubmission';

      // 3001-VOTE-038 3002-PROP-013 3002-PROP-014
      goToMakeNewProposal(governanceProposalType.RAW);

      cy.fixture('/proposals/raw.json').then((freeformProposal) => {
        freeformProposal.terms.closingTimestamp =
          createTenDigitUnixTimeStampForSpecifiedDays(8);
        freeformProposal.unexpected = `i shouldn't be here`;
        const proposalPayload = JSON.stringify(freeformProposal);
        cy.get(rawProposalData).type(proposalPayload, {
          parseSpecialCharSequences: false,
          delay: 2,
        });
      });
      cy.get(newProposalSubmitButton).should('be.visible').click();

      cy.contains('Transaction failed', proposalTimeout).should('be.visible');
      cy.get(feedbackError).should('have.text', errorMsg);
      closeDialog();
      cy.get(rawProposalData)
        .invoke('val')
        .should('contain', "i shouldn't be here");
    });

    it('Unable to create a freeform proposal - when json terms section contains unexpected field', function () {
      // 3001-VOTE-038
      const errorMsg =
        'Invalid params: the transaction does not use a valid Vega command: unknown field "unexpectedField" in vega.ProposalTerms';

      goToMakeNewProposal(governanceProposalType.RAW);

      cy.fixture('/proposals/raw.json').then((rawProposal) => {
        rawProposal.terms.closingTimestamp =
          createTenDigitUnixTimeStampForSpecifiedDays(8);
        rawProposal.terms.unexpectedField = `i shouldn't be here`;
        const proposalPayload = JSON.stringify(rawProposal);

        cy.get(rawProposalData).type(proposalPayload, {
          parseSpecialCharSequences: false,
          delay: 2,
        });
      });
      cy.get(newProposalSubmitButton).should('be.visible').click();

      cy.contains('Transaction failed', proposalTimeout).should('be.visible');
      cy.get(feedbackError).should('have.text', errorMsg);
      closeDialog();
    });

    // 3007-PNE-022 3007-PNE-023 3004-PMAC-006 3004-PMAC-007 3005-PASN-006 3005-PASN-007
    // 3006-PASC-006 3006-PASC-007 3008-PFRO-018 3008-PFRO-019 3003-PMAN-006 3003-PMAN-007
    it('Unable to submit proposal without valid json', function () {
      goToMakeNewProposal(governanceProposalType.RAW);
      cy.get(newProposalSubmitButton).click();
      cy.getByTestId('input-error-text').should('have.text', 'Required');
      cy.get(rawProposalData).type('Not a valid json string');
      cy.get(newProposalSubmitButton).click();
      cy.getByTestId('input-error-text').should(
        'have.text',
        'Must be valid JSON'
      );
    });

    // 1005-PROP-009
    it('Unable to vote on a freeform proposal - when some but not enough vega associated', function () {
      const proposalTitle = generateFreeFormProposalTitle();

      ensureSpecifiedUnstakedTokensAreAssociated('1');
      submitUniqueRawProposal({ proposalTitle: proposalTitle });
      ethereumWalletConnect();
      stakingPageDisassociateTokens('0.0001');
      cy.get(vegaWallet)
        .first()
        .within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should(
            'contain',
            '0.9999'
          );
        });
      navigateTo(navigation.proposals);
      getProposalFromTitle(proposalTitle).within(() =>
        cy.get(viewProposalButton).click()
      );
      cy.contains('Vote breakdown').should('be.visible', {
        timeout: 10000,
      });
      cy.get(voteButtons).should('not.exist');
      cy.getByTestId('min-proposal-requirements').should(
        'have.text',
        `You must have at least ${this.minVoterBalance} VEGA associated to vote on this proposal`
      );
    });

    it('Unable to vote on a proposal - when vega wallet disconnected - option to connect from within', function () {
      createRawProposal();
      cy.get('[data-testid="manage-vega-wallet"]:visible').click();
      cy.get('[data-testid="disconnect"]').click();
      cy.get<testFreeformProposal>('@rawProposal').then((rawProposal) => {
        getProposalFromTitle(rawProposal.rationale.title).within(() =>
          cy.get(viewProposalButton).click()
        );
      });
      // 3001-VOTE-075
      // 3001-VOTE-076
      cy.get(connectToVegaWalletButton)
        .should('be.visible')
        .and('have.text', 'Connect Vega wallet')
        .click();
      cy.getByTestId('connector-jsonRpc').click();
      cy.get(vegaWalletNameElement).should('be.visible');
      cy.get(connectToVegaWalletButton).should('not.exist');
      // 3001-VOTE-100
      cy.get(vegaWalletAssociatedBalance, txTimeout).contains(
        '1.00',
        txTimeout
      );
      voteForProposal('against');
      // 3001-VOTE-079
      cy.contains('You voted: Against').should('be.visible');
    });
  }
);
