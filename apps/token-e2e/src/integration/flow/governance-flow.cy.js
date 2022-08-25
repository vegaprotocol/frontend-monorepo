/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types="cypress" />

import { lowerCase } from "lodash";

const newProposalButton = '[data-testid="new-proposal-link"]';
const newProposalDatabox = '[data-testid="proposal-data"]';
const newProposalSubmitButton = '[data-testid="proposal-submit"]';
const dialogCloseButton = '[data-testid="dialog-close"]';
const viewProposalButton = '[data-testid="view-proposal-btn"]';
const proposalInformationTableRows = '[data-testid="key-value-table-row"]';
const openProposals = '[data-testid="open-proposals"]';
const vegaWalletAssociatedBalance = '[data-testid="currency-value"]';
const proposalResponseIdPath = 'response.body.data.busEvents.0.event.id';
const proposalVoteProgressForPercentage =
  '[data-testid="vote-progress-indicator-percentage-for"]';
const proposalVoteProgressAgainstPercentage =
  '[data-testid="vote-progress-indicator-percentage-against"]';
const proposalVoteProgressForTokens =
  '[data-testid="vote-progress-indicator-tokens-for"]';
const proposalVoteProgressAgainstTokens =
  '[data-testid="vote-progress-indicator-tokens-against"]';
const changeVoteButton = '[data-testid="change-vote-button"]';
const voteButtons = '[data-testid="vote-buttons"]';
const rejectProposalsLink = '[href="/governance/rejected"]'
const txTimeout = Cypress.env('txTimeout');

context('Governance flow - with eth and vega wallets connected', function () {
  before('connect wallets and set approval limit', function () {
    cy.vega_wallet_import();
    cy.visit('/');
    cy.verify_page_header('The $VEGA token');
    cy.get_network_parameters().then((network_parameters) => {
      cy.wrap(
        network_parameters['governance.proposal.freeform.minProposerBalance']
      ).as('minProposerBalance');
      cy.wrap(
        network_parameters['governance.proposal.freeform.minVoterBalance']
      ).as('minVoterBalance');
      cy.wrap(
        network_parameters['governance.proposal.freeform.requiredMajority'] *
          100
      ).as('requiredMajority');
      cy.wrap(
        network_parameters[
          'governance.proposal.freeform.requiredParticipation'
        ] * 100
      ).as('requiredParticipation');
      cy.wrap(
        network_parameters['governance.proposal.freeform.minClose'].split(
          'h'
        )[0] / 24
      ).as('minCloseDays');
      cy.wrap(
        network_parameters['governance.proposal.freeform.maxClose'].split(
          'h'
        )[0] / 24
      ).as('maxCloseDays');
    });
    cy.vega_wallet_connect();
    cy.vega_wallet_set_specified_approval_amount('1000');
    cy.reload();
    cy.wait_for_spinner();
    cy.verify_page_header('The $VEGA token');
    cy.ethereum_wallet_connect();
  });

  describe('Eth wallet - contains VEGA tokens', function () {
    before(
      'checking network parameters (therefore environment) is fit for test',
      function () {
        assert.isAtLeast(
          parseInt(this.minProposerBalance),
          1,
          'Asserting that value is at least 1 for network parameter minProposerBalance'
        );
        assert.isAtLeast(
          parseInt(this.minVoterBalance),
          1,
          'Asserting that value is at least 1 for network parameter minVoterBalance'
        );
        assert.isAtLeast(
          parseFloat(this.requiredParticipation),
          0.00001,
          'Asserting that value is at least 0.00001 for network parameter requiredParticipation'
        );
        assert.isAtLeast(
          parseInt(this.minCloseDays),
          1,
          'Asserting that value is at least 1 for network parameter minCloseDays'
        );
        assert.isAtLeast(
          parseInt(this.maxCloseDays),
          parseInt(this.minCloseDays + 1),
          'Asserting that network parameter maxCloseDays is higher than minCloseDays'
        );
      }
    );

    beforeEach('visit staking tab', function () {
      cy.navigate_to('staking');
      cy.wait_for_spinner();
      cy.intercept('POST', '/query', (req) => {
        if (req.body.operationName === 'ProposalEvent') {
          req.alias = 'proposalSubmissionCompletion';
        }
      });
    });

    it('Able to submit a valid freeform proposal - with minimum required tokens associated', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.get(newProposalDatabox).click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('7').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Proposal submitted').should('be.visible');
      cy.get(dialogCloseButton).wait(1500).click();
    });

    it('Newly created freeform proposal - able to filter by proposalID to show it in list', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.get(newProposalDatabox).click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('7').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Proposal submitted').should('be.visible');
      cy.get(dialogCloseButton).wait(1500).click();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.wait('@proposalSubmissionCompletion')
        .its(proposalResponseIdPath)
        .then((proposalId) => {
          cy.get('[data-testid="set-proposals-filter-visible"]').click();
          cy.get('[data-testid="filter-input"]').type(proposalId);
          cy.get(`#${proposalId}`)
              .should('contain', `Freeform proposal: ${proposalId}`, {timeout:txTimeout})
        });
    });

    it('Newly created freeform proposal - shows in an open state', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.get(newProposalDatabox).click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('8').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Proposal submitted').should('be.visible');
      cy.get(dialogCloseButton).wait(1500).click();
      cy.wait('@proposalSubmissionCompletion')
        .its(proposalResponseIdPath)
        .then((proposalId) => {
          cy.navigate_to('governance');
          cy.wait_for_spinner();
          cy.get(openProposals).within(() => {
            cy.get(`#${proposalId}`)
              .should('contain', `Freeform proposal: ${proposalId}`, {timeout:txTimeout})
              .and('contain', 'Open')
              .and('be.visible')
              .within(() => {
                cy.get(viewProposalButton).should('be.visible').click();
              });
          });
          cy.get_proposal_information_from_table('ID')
            .contains(proposalId)
            .and('be.visible');
          cy.get_proposal_information_from_table('State')
            .contains('STATE_OPEN')
            .and('be.visible');
          cy.get_proposal_information_from_table('Type')
            .contains('NewFreeform')
            .and('be.visible');
        });
    });

    it('Newly created freeform proposal - shows proposed and closing dates', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.get(newProposalDatabox).click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('9').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
          cy.get(newProposalSubmitButton).should('be.visible').click();
          cy.contains('Proposal submitted').should('be.visible');
          cy.get(dialogCloseButton).wait(1500).click();
          cy.navigate_to('governance');
          cy.wait_for_spinner();
          cy.get_submitted_proposal_from_proposal_list().within(() =>
            cy.get(viewProposalButton).click()
          );
          cy.convert_unix_timestamp_to_governance_data_table_date_format(
            closingDateTimestamp
          ).then((closingDate) => {
            cy.get_proposal_information_from_table('Closes on')
              .contains(closingDate)
              .should('be.visible');
          });
        }
      );
      cy.get_governance_proposal_date_format_for_specified_days('0').then(
        (proposalDate) => {
          cy.get_proposal_information_from_table('Proposed on')
            .contains(proposalDate)
            .should('be.visible');
        }
      );
      cy.contains('9 days left to vote').should('be.visible');
    });

    it('Newly created freeform proposal - shows default status set to fail', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.get(newProposalDatabox).click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('7').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Proposal submitted').should('be.visible');
      cy.get(dialogCloseButton).wait(1500).click();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get_submitted_proposal_from_proposal_list().within(() =>
        cy.get(viewProposalButton).click()
      );
      cy.contains('Currently set to fail').should('be.visible');
      cy.contains('Participation: Not Met 0.00 0.00%(0.00% Required)').should(
        'be.visible'
      );
      cy.get_proposal_information_from_table('Will pass')
        .contains('👎')
        .should('be.visible');
      cy.get_proposal_information_from_table('Majority met')
        .contains('👎')
        .should('be.visible');
      cy.get_proposal_information_from_table('Participation met')
        .contains('👎')
        .should('be.visible');
    });

    it('Newly created freeform proposal - ability to vote for - with minimum required tokens associated', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.get(newProposalDatabox).click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('7').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Proposal submitted').should('be.visible');
      cy.get(dialogCloseButton).wait(1500).click();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get_submitted_proposal_from_proposal_list()
        .as('submittedProposal')
        .within(() => cy.get(viewProposalButton).click());
      cy.vote_for_proposal('for');
      cy.get_governance_proposal_date_format_for_specified_days(
        '0',
        'shortMonth'
      ).then((votedDate) => {
        cy.contains('You voted:')
          .siblings()
          .contains('For')
          .siblings()
          .contains(votedDate)
          .should('be.visible');
      });
      cy.get(proposalVoteProgressForPercentage)
        .contains('100.00%')
        .and('be.visible');
      cy.get(proposalVoteProgressAgainstPercentage)
        .contains('0.00%')
        .and('be.visible');
      cy.get(proposalVoteProgressForTokens).contains('1.00').and('be.visible');
      cy.get(proposalVoteProgressAgainstTokens)
        .contains('0.00')
        .and('be.visible');
      cy.get_proposal_information_from_table('Tokens for proposal')
        .should('have.text', parseFloat(this.minProposerBalance).toFixed(2))
        .and('be.visible');
      cy.get_proposal_information_from_table('Tokens against proposal')
        .should('have.text', '0.00')
        .and('be.visible');
      cy.get_proposal_information_from_table('Participation required')
        .contains(`${this.requiredParticipation}%`)
        .should('be.visible');
      cy.get_proposal_information_from_table('Majority Required')
        .contains(`${parseFloat(this.requiredMajority).toFixed(2)}%`)
        .should('be.visible');
      cy.get_proposal_information_from_table('Number of voting parties')
        .should('have.text', '1')
        .and('be.visible');
    });

    it('Newly created freeform proposal - ability to vote against - with minimum required tokens associated', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.get(newProposalDatabox).click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('7').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Proposal submitted').should('be.visible');
      cy.get(dialogCloseButton).wait(1500).click();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get_submitted_proposal_from_proposal_list()
        .as('submittedProposal')
        .within(() => cy.get(viewProposalButton).click());
      cy.vote_for_proposal('against');
      cy.get_governance_proposal_date_format_for_specified_days(
        '0',
        'shortMonth'
      ).then((votedDate) => {
        cy.contains('You voted:')
          .siblings()
          .contains('Against')
          .siblings()
          .contains(votedDate)
          .should('be.visible');
      });
      cy.get(proposalVoteProgressForPercentage)
        .contains('0.00%')
        .and('be.visible');
      cy.get(proposalVoteProgressAgainstPercentage)
        .contains('100.00%')
        .and('be.visible');
      cy.get(proposalVoteProgressForTokens).contains('0.00').and('be.visible');
      cy.get(proposalVoteProgressAgainstTokens)
        .contains('1.00')
        .and('be.visible');
      cy.get_proposal_information_from_table('Tokens for proposal')
        .should('have.text', '0.00')
        .and('be.visible');
      cy.get_proposal_information_from_table('Tokens against proposal')
        .should('have.text', parseFloat(this.minProposerBalance).toFixed(2))
        .and('be.visible');
      cy.get_proposal_information_from_table('Participation required')
        .contains(`${this.requiredParticipation}%`)
        .should('be.visible');
      cy.get_proposal_information_from_table('Majority Required')
        .contains(`${parseFloat(this.requiredMajority).toFixed(2)}%`)
        .should('be.visible');
      cy.get_proposal_information_from_table('Number of voting parties')
        .should('have.text', '1')
        .and('be.visible');
    });

    it('Newly created freeform proposal - ability to change vote from against to for - with minimum required tokens associated', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.get(newProposalDatabox).click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('7').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Proposal submitted').should('be.visible');
      cy.get(dialogCloseButton).wait(1500).click();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get_submitted_proposal_from_proposal_list()
        .as('submittedProposal')
        .within(() => cy.get(viewProposalButton).click());
      cy.vote_for_proposal('against');
      cy.get(changeVoteButton).should('be.visible').click();
      cy.wait_for_spinner();
      cy.vote_for_proposal('for');
      cy.get(proposalVoteProgressForPercentage)
        .contains('100.00%')
        .and('be.visible');
      cy.get(proposalVoteProgressAgainstPercentage)
        .contains('0.00%')
        .and('be.visible');
      cy.get(proposalVoteProgressForTokens).contains('1.00').and('be.visible');
      cy.get(proposalVoteProgressAgainstTokens)
        .contains('0.00')
        .and('be.visible');
      cy.get_proposal_information_from_table('Tokens for proposal')
        .should('have.text', parseFloat(this.minProposerBalance).toFixed(2))
        .and('be.visible');
      cy.get_proposal_information_from_table('Tokens against proposal')
        .should('have.text', '0.00')
        .and('be.visible');
      cy.get_proposal_information_from_table('Participation required')
        .contains(`${this.requiredParticipation}%`)
        .should('be.visible');
      cy.get_proposal_information_from_table('Majority Required')
        .contains(`${parseFloat(this.requiredMajority).toFixed(2)}%`)
        .should('be.visible');
      cy.get_proposal_information_from_table('Number of voting parties')
        .should('have.text', '1')
        .and('be.visible');
    });

    it('Newly created freeform proposal - ability to change vote from for to against - with minimum required tokens associated', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.get(newProposalDatabox).click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('7').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Proposal submitted').should('be.visible');
      cy.get(dialogCloseButton).wait(1500).click();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get_submitted_proposal_from_proposal_list()
        .as('submittedProposal')
        .within(() => cy.get(viewProposalButton).click());
      cy.vote_for_proposal('for');
      cy.get(changeVoteButton).should('be.visible').click();
      cy.wait_for_spinner();
      cy.vote_for_proposal('against');
      cy.get(proposalVoteProgressForPercentage)
        .contains('0.00%')
        .and('be.visible');
      cy.get(proposalVoteProgressAgainstPercentage)
        .contains('100.00%')
        .and('be.visible');
      cy.get(proposalVoteProgressForTokens).contains('0.00').and('be.visible');
      cy.get(proposalVoteProgressAgainstTokens)
        .contains('1.00')
        .and('be.visible');
      cy.get_proposal_information_from_table('Tokens for proposal')
        .should('have.text', '0.00')
        .and('be.visible');
      cy.get_proposal_information_from_table('Tokens against proposal')
        .should('have.text', parseFloat(this.minProposerBalance).toFixed(2))
        .and('be.visible');
      cy.get_proposal_information_from_table('Participation required')
        .contains(`${this.requiredParticipation}%`)
        .should('be.visible');
      cy.get_proposal_information_from_table('Majority Required')
        .contains(`${parseFloat(this.requiredMajority).toFixed(2)}%`)
        .should('be.visible');
      cy.get_proposal_information_from_table('Number of voting parties')
        .should('have.text', '1')
        .and('be.visible');
    });

    it('Newly created freeform proposal - ability to increase associated tokens - so that vote sways result', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.get(newProposalDatabox).click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('7').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Proposal submitted').should('be.visible');
      cy.get(dialogCloseButton).wait(1500).click();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get_submitted_proposal_from_proposal_list()
        .as('submittedProposal')
        .within(() => cy.get(viewProposalButton).click());
      cy.vote_for_proposal('for');
      cy.get_proposal_information_from_table('Total Supply')
        .invoke('text')
        .then((totalSupply) => {
          let tokensRequiredToAcheiveResult = parseFloat(
            (totalSupply.replace(/,/g, '') * this.requiredParticipation) / 100
          ).toFixed(2);
          cy.ensure_specified_unstaked_tokens_are_associated(
            tokensRequiredToAcheiveResult
          );
          cy.navigate_to('governance');
          cy.wait_for_spinner();
          cy.get('@submittedProposal').within(() =>
            cy.get(viewProposalButton).click()
          );
          cy.get(proposalVoteProgressForPercentage)
            .contains('100.00%')
            .and('be.visible');
          cy.get(proposalVoteProgressAgainstPercentage)
            .contains('0.00%')
            .and('be.visible');
          cy.get(proposalVoteProgressForTokens)
            .contains(tokensRequiredToAcheiveResult)
            .and('be.visible');
          cy.get(proposalVoteProgressAgainstTokens)
            .contains('0.00')
            .and('be.visible');
          cy.get_proposal_information_from_table('Tokens for proposal')
            .should('have.text', tokensRequiredToAcheiveResult)
            .and('be.visible');
          cy.get_proposal_information_from_table('Tokens against proposal')
            .should('have.text', '0.00')
            .and('be.visible');
          cy.get_proposal_information_from_table('Number of voting parties')
            .should('have.text', '1')
            .and('be.visible');
        });
    });

    it.only('Creating a proposal - proposal rejected - when closing time sooner than system default', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.get(newProposalDatabox).click();
      cy.create_ten_digit_unix_timestamp_for_specified_days(
        this.minCloseDays - 1
      ).then((closingDateTimestamp) => {
        cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
      });
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Proposal rejected').should('be.visible');
      cy.get(dialogCloseButton).wait(1500).click();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get_submitted_proposal_from_rejected_proposal_list().within(() => {
        cy.contains('Rejected').should('be.visible');
        cy.contains('Close time too soon').should('be.visible');
        cy.get(viewProposalButton).click();
      });
      cy.get_proposal_information_from_table('State')
        .contains('Rejected')
        .and('be.visible');
      cy.get_proposal_information_from_table('Rejection reason')
        .contains('CloseTimeTooSoon')
        .and('be.visible');
      cy.get_proposal_information_from_table('Error details')
        .contains('proposal closing time too soon')
        .and('be.visible');
    });

    it.only('Creating a proposal - proposal rejected - when closing time later than system default', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.get(newProposalDatabox).click();
      cy.create_ten_digit_unix_timestamp_for_specified_days(
        this.maxCloseDays + 1
      ).then((closingDateTimestamp) => {
        cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
      });
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Proposal rejected').should('be.visible');
      cy.get(dialogCloseButton).wait(1500).click();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get_submitted_proposal_from_rejected_proposal_list().within(() => {
        cy.contains('Rejected').should('be.visible');
        cy.contains('Close time too late').should('be.visible');
        cy.get(viewProposalButton).click();
      });
      cy.get_proposal_information_from_table('State')
        .contains('Rejected')
        .and('be.visible');
      cy.get_proposal_information_from_table('Rejection reason')
        .contains('CloseTimeTooLate')
        .and('be.visible');
      cy.get_proposal_information_from_table('Error details')
        .contains('proposal closing time too late')
        .and('be.visible');
    });

    it.skip('Unable to create a freeform proposal - when no tokens are associated', function () {
      cy.vega_wallet_teardown();
      cy.get(vegaWalletAssociatedBalance, txTimeout).contains(
        '0.000000000000000000',
        txTimeout
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.get(newProposalDatabox).click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('1').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.wait('@proposalSubmissionCompletion');
      cy.contains(
        'party has insufficient tokens to submit proposal request in this epoch'
      ).should('be.visible');
    });

    it.skip('Unable to create a freeform proposal - when some but not enough tokens are associated', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance - 0.1
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.get(newProposalDatabox).click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('1').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.wait('@proposalSubmissionCompletion');
      cy.contains(
        'party has insufficient tokens to submit proposal request in this epoch'
      ).should('be.visible');
    });

    Cypress.Commands.add(
      'convert_unix_timestamp_to_governance_data_table_date_format',
      (unixTimestamp, monthTextLength = 'longMonth') => {
        let dateSupplied = new Date(unixTimestamp * 1000),
          year = dateSupplied.getFullYear(),
          months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
          ],
          month = months[dateSupplied.getMonth()],
          shortMonth = months[dateSupplied.getMonth()].substring(0, 3),
          date = dateSupplied.getDate();

        if (monthTextLength === 'longMonth') return `${date} ${month} ${year}`;
        else return `${date} ${shortMonth} ${year}`;
      }
    );

    Cypress.Commands.add(
      'create_ten_digit_unix_timestamp_for_specified_days',
      (durationDays) => {
        let today = new Date();
        let timestamp = today.setDate(today.getDate() + parseInt(durationDays));
        timestamp = Math.floor(timestamp / 1000);

        return timestamp;
      }
    );

    Cypress.Commands.add('enter_unique_freeform_proposal_body', (timestamp) => {
      cy.fixture('/proposals/freeform.json').then((freeformProposal) => {
        freeformProposal.terms.closingTimestamp = timestamp;
        freeformProposal.rationale.title += timestamp;
        let proposalPayload = JSON.stringify(freeformProposal);

        cy.get(newProposalDatabox).type(proposalPayload, {
          parseSpecialCharSequences: false,
          delay: 2,
        });
      });
    });

    Cypress.Commands.add('get_network_parameters', () => {
      let mutation = '{networkParameters {key value}}';
      cy.request({
        method: 'POST',
        url: `http://localhost:3028/query`,
        body: {
          query: mutation,
        },
        headers: { 'content-type': 'application/json' },
      })
        .its(`body.data.networkParameters`)
        .then(function (response) {
          let object = response.reduce(function (r, e) {
            r[e.key] = e.value;
            return r;
          }, {});

          return object;
        });
    });

    Cypress.Commands.add('get_submitted_proposal_from_proposal_list', () => {
      cy.wait('@proposalSubmissionCompletion')
        .its(proposalResponseIdPath)
        .then((proposalId) => {
          return cy.get(`#${proposalId}`);
        });
    });

    Cypress.Commands.add('get_submitted_proposal_from_rejected_proposal_list', () => {
      cy.wait('@proposalSubmissionCompletion')
        .its(proposalResponseIdPath)
        .then((proposalId) => {
          cy.get(rejectProposalsLink).click().wait_for_spinner()
          return cy.get(`#${proposalId}`);
        });
    });

    Cypress.Commands.add(
      'get_governance_proposal_date_format_for_specified_days',
      (days, shortOrLong) => {
        cy.create_ten_digit_unix_timestamp_for_specified_days(days).then(
          (date) => {
            cy.convert_unix_timestamp_to_governance_data_table_date_format(
              date,
              shortOrLong
            ).then((convertedDate) => {
              return convertedDate;
            });
          }
        );
      }
    );

    Cypress.Commands.add('get_proposal_information_from_table', (heading) => {
      cy.get(proposalInformationTableRows).contains(heading).siblings();
    });

    Cypress.Commands.add('vote_for_proposal', (vote) => {
      cy.contains('Vote breakdown').should('be.visible', { timeout: 10000 });
      cy.get(voteButtons).contains(vote).click()
      cy.contains('Casting vote...').should('be.visible');
      cy.contains('Casting vote...', { timeout: txTimeout }).should(
        'not.exist'
      );

      // below section temporary until #1090 fixed Casting vote in vegacapsule always says:
      // Something went wrong, and your vote was not seen by the network - despite vote success
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get('@submittedProposal').within(() =>
        cy.get(viewProposalButton).click()
      );
      cy.wait_for_spinner();
    });
  });
});
