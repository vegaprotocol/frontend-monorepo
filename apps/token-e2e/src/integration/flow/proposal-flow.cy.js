/// <reference types="cypress" />
import {
  createRawProposal,
  generateFreeFormProposalTitle,
  governanceProposalType,
} from '../../support/governance.functions';

import { associateTokenStartOfTests } from '../../support/common.functions';

const vegaWalletUnstakedBalance =
  '[data-testid="vega-wallet-balance-unstaked"]';
const vegaWalletStakedBalances =
  '[data-testid="vega-wallet-balance-staked-validators"]';
const vegaWalletAssociatedBalance = '[data-testid="currency-value"]';
const vegaWalletNameElement = '[data-testid="wallet-name"]';
const vegaWallet = '[data-testid="vega-wallet"]';
const connectToVegaWalletButton = '[data-testid="connect-to-vega-wallet-btn"]';
const newProposalSubmitButton = '[data-testid="proposal-submit"]';
const dialogCloseButton = '[data-testid="dialog-close"]';
const viewProposalButton = '[data-testid="view-proposal-btn"]';
const rawProposalData = '[data-testid="proposal-data"]';
const minVoteButton = '[data-testid="min-vote"]';
const maxVoteButton = '[data-testid="max-vote"]';
const voteButtons = '[data-testid="vote-buttons"]';
const votingDate = '[data-testid="voting-date"]';
const voteTwoMinExtraNote = '[data-testid="voting-2-mins-extra"]';
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
          network_parameters['spam.protection.proposal.min.tokens'] /
            1000000000000000000
        ).as('minProposerBalance');
        cy.wrap(
          network_parameters['spam.protection.voting.min.tokens'] /
            1000000000000000000
        ).as('minVoterBalance');
        cy.wrap(
          network_parameters['governance.proposal.freeform.requiredMajority'] *
            100
        ).as('requiredMajority');
      });

      cy.vega_wallet_set_specified_approval_amount('1000');
      associateTokenStartOfTests();
    });

    beforeEach('visit governance tab', function () {
      cy.reload();
      cy.wait_for_spinner();
      cy.connectVegaWallet();
      cy.ethereum_wallet_connect();
      cy.ensure_specified_unstaked_tokens_are_associated(1);
      cy.navigate_to_page_if_not_already_loaded('proposals');
    });

    it('Should be able to see that no proposals exist', function () {
      // 3001-VOTE-003
      cy.get(noOpenProposals)
        .should('be.visible')
        .and('have.text', 'There are no open or yet to enact proposals');
      cy.get(noClosedProposals)
        .should('be.visible')
        .and('have.text', 'There are no enacted or rejected proposals');
    });

    // 3002-PROP-002
    // 3002-PROP-003
    it('Submit a proposal form - shows how many vega tokens are required to make a proposal', function () {
      // 3002-PROP-005
      cy.go_to_make_new_proposal(governanceProposalType.NEW_MARKET);
      cy.contains(
        `You must have at least 1 VEGA associated to make a proposal`
      ).should('be.visible');
    });

    // 3002-PROP-011
    it('Able to submit a valid freeform proposal - with minimum required tokens associated', function () {
      cy.go_to_make_new_proposal(governanceProposalType.FREEFORM);
      cy.get(minVoteButton).should('be.visible'); // 3002-PROP-008
      cy.get(maxVoteButton).should('be.visible');
      cy.get(votingDate).should('not.be.empty');
      cy.get(voteTwoMinExtraNote).should(
        'contain.text',
        'we add 2 minutes of extra time'
      );
      cy.enter_unique_freeform_proposal_body(
        '50',
        generateFreeFormProposalTitle()
      );
      // 3002-PROP-012
      // 3002-PROP-016
      cy.wait_for_proposal_submitted();
    });

    it('Able to submit a valid freeform proposal - with minimum required tokens associated - but also staked', function () {
      cy.ensure_specified_unstaked_tokens_are_associated('2');
      cy.get(vegaWalletUnstakedBalance, txTimeout).should('contain', '2');
      cy.navigate_to('validators');
      cy.click_on_validator_from_list(0);
      cy.staking_validator_page_add_stake('2');
      cy.close_staking_dialog();

      cy.get(vegaWalletStakedBalances, txTimeout).should('contain', '2');

      cy.navigate_to('proposals');
      cy.go_to_make_new_proposal(governanceProposalType.FREEFORM);
      cy.enter_unique_freeform_proposal_body(
        '50',
        generateFreeFormProposalTitle()
      );
      cy.wait_for_proposal_submitted();
    });

    it('Creating a proposal - proposal rejected - when closing time sooner than system default', function () {
      cy.go_to_make_new_proposal(governanceProposalType.FREEFORM);
      cy.enter_unique_freeform_proposal_body(
        '0.1',
        generateFreeFormProposalTitle()
      );
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'not.exist'
      );
      cy.get('input:invalid')
        .invoke('prop', 'validationMessage')
        .should('equal', 'Value must be greater than or equal to 1.');
    });

    it('Creating a proposal - proposal rejected - when closing time later than system default', function () {
      cy.go_to_make_new_proposal(governanceProposalType.FREEFORM);
      cy.enter_unique_freeform_proposal_body(
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
      cy.go_to_make_new_proposal(governanceProposalType.RAW);
      cy.create_ten_digit_unix_timestamp_for_specified_days('1000').then(
        (closingDateTimestamp) => {
          cy.enter_raw_proposal_body(closingDateTimestamp).as('rawProposal');
        }
      );
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Proposal rejected', proposalTimeout).should('be.visible');
      cy.get(dialogCloseButton).click();
      cy.wait_for_proposal_sync();
      cy.navigate_to('proposals');
      cy.get(rejectProposalsLink).click();
      cy.get('@rawProposal').then((rawProposal) => {
        cy.get_submitted_proposal_from_proposal_list(
          rawProposal.rationale.title
        ).within(() => {
          cy.contains('Rejected').should('be.visible');
          cy.contains('Close time too late').should('be.visible');
          cy.get(viewProposalButton).click();
        });
      });
      cy.get_proposal_information_from_table('State')
        .contains('Rejected')
        .and('be.visible');
      cy.get_proposal_information_from_table('Rejection reason')
        .contains('PROPOSAL_ERROR_CLOSE_TIME_TOO_LATE')
        .and('be.visible');
      cy.get_proposal_information_from_table('Error details')
        .contains('proposal closing time too late')
        .and('be.visible');
    });

    // 0005-ETXN-004
    it('Unable to create a proposal - when no tokens are associated', function () {
      cy.vega_wallet_teardown();
      cy.get(vegaWalletAssociatedBalance, txTimeout).contains(
        '0.00',
        txTimeout
      );
      cy.go_to_make_new_proposal(governanceProposalType.RAW);
      cy.create_ten_digit_unix_timestamp_for_specified_days('8').then(
        (closingDateTimestamp) => {
          cy.enter_raw_proposal_body(closingDateTimestamp).as;
        }
      );
      cy.contains('Transaction failed', proposalTimeout).should('be.visible');
      cy.get(feedbackError).should(
        'have.text',
        'Network error: the network blocked the transaction through the spam protection'
      );
      cy.get(dialogCloseButton).click();
    });

    // 3002-PROP-009
    it('Unable to create a proposal - when some but not enough tokens are associated', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(0.000001);
      cy.go_to_make_new_proposal(governanceProposalType.RAW);
      cy.create_ten_digit_unix_timestamp_for_specified_days('8').then(
        (closingDateTimestamp) => {
          cy.enter_raw_proposal_body(closingDateTimestamp);
        }
      );
      cy.contains('Transaction failed', proposalTimeout).should('be.visible');
      cy.get(feedbackError).should(
        'have.text',
        'Network error: the network blocked the transaction through the spam protection'
      );
      cy.get(dialogCloseButton).click();
    });

    it('Unable to create a freeform proposal - when json parent section contains unexpected field', function () {
      // 3001-VOTE-038 3002-PROP-013 3002-PROP-014
      cy.go_to_make_new_proposal(governanceProposalType.RAW);
      cy.create_ten_digit_unix_timestamp_for_specified_days('8').then(
        (closingDateTimestamp) => {
          cy.fixture('/proposals/raw.json').then((freeformProposal) => {
            freeformProposal.terms.closingTimestamp = closingDateTimestamp;
            freeformProposal.unexpected = `i shouldn't be here`;
            let proposalPayload = JSON.stringify(freeformProposal);
            cy.get(rawProposalData).type(proposalPayload, {
              parseSpecialCharSequences: false,
              delay: 2,
            });
          });
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();

      cy.contains('Transaction failed', proposalTimeout).should('be.visible');
      cy.get(feedbackError).should(
        'have.text',
        'Invalid params: the transaction is malformed'
      );
      cy.get(dialogCloseButton).click();
      cy.get(rawProposalData)
        .invoke('val')
        .should('contain', "i shouldn't be here");
    });

    it('Unable to create a freeform proposal - when json terms section contains unexpected field', function () {
      // 3001-VOTE-038
      cy.go_to_make_new_proposal(governanceProposalType.RAW);
      cy.create_ten_digit_unix_timestamp_for_specified_days('8').then(
        (closingDateTimestamp) => {
          cy.fixture('/proposals/raw.json').then((rawProposal) => {
            rawProposal.terms.closingTimestamp = closingDateTimestamp;
            rawProposal.terms.unexpectedField = `i shouldn't be here`;
            let proposalPayload = JSON.stringify(rawProposal);

            cy.get(rawProposalData).type(proposalPayload, {
              parseSpecialCharSequences: false,
              delay: 2,
            });
          });
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();

      cy.contains('Transaction failed', proposalTimeout).should('be.visible');
      cy.get(feedbackError).should(
        'have.text',
        'Invalid params: the transaction is malformed'
      );
      cy.get(dialogCloseButton).click();
    });

    // 1005-PROP-009
    it('Unable to vote on a freeform proposal - when some but not enough vega associated', function () {
      const proposalTitle = generateFreeFormProposalTitle();

      cy.ensure_specified_unstaked_tokens_are_associated(1);
      cy.go_to_make_new_proposal(governanceProposalType.FREEFORM);
      cy.enter_unique_freeform_proposal_body('50', proposalTitle);
      cy.wait_for_proposal_submitted();
      cy.staking_page_disassociate_tokens('0.0001');
      cy.get(vegaWallet).within(() => {
        cy.get(vegaWalletAssociatedBalance).should('have.length', 1);
        cy.get(vegaWalletAssociatedBalance, txTimeout).should(
          'contain',
          '0.9999'
        );
      });
      cy.navigate_to('proposals');
      cy.get_submitted_proposal_from_proposal_list(proposalTitle).within(() =>
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
      cy.get('[data-testid="manage-vega-wallet"]').click();
      cy.get('[data-testid="disconnect"]').click();
      cy.get('@rawProposal').then((rawProposal) => {
        cy.get_submitted_proposal_from_proposal_list(
          rawProposal.rationale.title
        ).within(() => cy.get(viewProposalButton).click());
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
      cy.vote_for_proposal('against');
      // 3001-VOTE-079
      cy.contains('You voted: Against').should('be.visible');
    });
  }
);
