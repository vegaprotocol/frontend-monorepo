/// <reference types="cypress" />

const vegaWalletUnstakedBalance =
  '[data-testid="vega-wallet-balance-unstaked"]';
const vegaWalletStakedBalances =
  '[data-testid="vega-wallet-balance-staked-validators"]';
const newProposalButton = '[data-testid="new-proposal-link"]';
const newProposalDatabox = '[data-testid="proposal-data"]';
const newProposalSubmitButton = '[data-testid="proposal-submit"]';
const dialogCloseButton = '[data-testid="dialog-close"]';
const viewProposalButton = '[data-testid="view-proposal-btn"]';
const proposalInformationTableRows = '[data-testid="key-value-table-row"]';
const openProposals = '[data-testid="open-proposals"]';
const vegaWalletAssociatedBalance = '[data-testid="currency-value"]';
const proposalResponseProposalIdPath =
  'response.body.data.busEvents.0.event.id';
const proposalVoteProgressForPercentage =
  '[data-testid="vote-progress-indicator-percentage-for"]';
const proposalVoteProgressAgainstPercentage =
  '[data-testid="vote-progress-indicator-percentage-against"]';
const proposalVoteProgressForTokens =
  '[data-testid="vote-progress-indicator-tokens-for"]';
const proposalVoteProgressAgainstTokens =
  '[data-testid="vote-progress-indicator-tokens-against"]';
const changeVoteButton = '[data-testid="change-vote-button"]';
const proposalDetailsTitle = '[data-testid="proposal-title"]';
const proposalDetailsDescription = '[data-testid="proposal-description"]';
const voteButtons = '[data-testid="vote-buttons"]';
const rejectProposalsLink = '[href="/governance/rejected"]';
const feedbackError = '[data-testid="Error"]';
const txTimeout = Cypress.env('txTimeout');
const epochTimeout = Cypress.env('epochTimeout');

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
          0.00001,
          'Asserting that value is at least 0.00001 for network parameter minProposerBalance'
        );
        assert.isAtLeast(
          parseInt(this.minVoterBalance),
          0.00001,
          'Asserting that value is at least 0.00001 for network parameter minVoterBalance'
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
          'Asserting that network parameter maxCloseDays is at least 1 day higher than minCloseDays'
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
      cy.create_ten_digit_unix_timestamp_for_specified_days('7').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Confirm transaction in wallet', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Proposal submitted', epochTimeout).should('be.visible');
      cy.get(dialogCloseButton).click();
    });

    it('Able to submit a valid freeform proposal - with minimum required tokens associated - but also staked', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.get(vegaWalletUnstakedBalance, txTimeout).should(
        'contain',
        this.minProposerBalance,
        txTimeout
      );
      cy.navigate_to('staking');
      cy.wait_for_spinner();
      cy.click_on_validator_from_list(0);
      cy.staking_validator_page_add_stake(this.minProposerBalance);

      cy.get(vegaWalletStakedBalances, txTimeout).should(
        'contain',
        this.minProposerBalance,
        txTimeout
      );

      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('7').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Proposal submitted', epochTimeout).should('be.visible');
      cy.get(dialogCloseButton).click();
    });

    it('Newly created freeform proposals list - able to filter by proposalID to show it in list', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('7').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Proposal submitted', epochTimeout).should('be.visible');
      cy.get(dialogCloseButton).click();
      cy.wait_for_proposal_sync();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.wait('@proposalSubmissionCompletion')
        .its(proposalResponseProposalIdPath)
        .then((proposalId) => {
          cy.get('[data-testid="set-proposals-filter-visible"]').click();
          cy.get('[data-testid="filter-input"]').type(proposalId);
          cy.get(`#${proposalId}`).should('contain', proposalId);
        });
    });

    it('Newly created freeform proposals list - able to filter by proposerID to show it in list', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('7').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Proposal submitted', epochTimeout).should('be.visible');
      cy.get(dialogCloseButton).click();
      cy.wait_for_proposal_sync();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.wait('@proposalSubmissionCompletion').then((proposal) => {
        let proposerId = proposal.request.body.variables.partyId;
        let proposalId = proposal.response.body.data.busEvents[0].event.id;
        cy.get('[data-testid="set-proposals-filter-visible"]').click();
        cy.get('[data-testid="filter-input"]').type(proposerId);
        cy.get(`#${proposalId}`).should('contain', proposalId);
      });
    });

    it('Newly created freeform proposals list - shows title and portion of summary', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('8').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp).as('freeformProposal');
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Proposal submitted', epochTimeout).should('be.visible');
      cy.get(dialogCloseButton).click();
      cy.wait_for_proposal_sync();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.wait('@proposalSubmissionCompletion')
        .its(proposalResponseProposalIdPath)
        .then((proposalId) => {
          cy.get(openProposals).within(() => {
            cy.get('@freeformProposal').then(freeformProposal => {
              // 1004-VOTE-008
              // 1004-VOTE-034
              cy.get(`#${proposalId}`)
                .should('contain', freeformProposal.rationale.title)
                .and('be.visible')
              cy.get(`#${proposalId}`)
                .should('contain', freeformProposal.rationale.description.substring(0,59))
                .and('be.visible')
            })
          });
        });
    });

    it('Newly created freeform proposals list - shows open proposals in an open state', function () {
      // 1004-VOTE-004 
      // 1004-VOTE-035 
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('8').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Proposal submitted', epochTimeout).should('be.visible');
      cy.get(dialogCloseButton).click();
      cy.wait_for_proposal_sync();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.wait('@proposalSubmissionCompletion')
        .its(proposalResponseProposalIdPath)
        .then((proposalId) => {
          cy.get(openProposals).within(() => {
            // 1004-VOTE-035 
            cy.get(`#${proposalId}`)
              .should('contain', proposalId)
              .and('contain', 'Open')
              .and('be.visible')
          });
        });
    });

    it('Newly created freeform proposal details - shows proposal title and full description', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('8').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp).as('freeformProposal');
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Proposal submitted', epochTimeout).should('be.visible');
      cy.get(dialogCloseButton).click();
      cy.wait_for_proposal_sync();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.wait('@proposalSubmissionCompletion')
        .its(proposalResponseProposalIdPath)
        .then((proposalId) => {
          cy.get(openProposals).within(() => {
            cy.get(`#${proposalId}`)
              .within(() => {
                cy.get(viewProposalButton).should('be.visible').click();
              });
            })
          cy.get('@freeformProposal').then(freeformProposal => {
            // 1004-VOTE-054
            cy.get(proposalDetailsTitle)
              .should('contain', freeformProposal.rationale.title)
              .and('be.visible')
            cy.get(proposalDetailsDescription)
              .should('contain', freeformProposal.rationale.description) 
              .and('be.visible')
          });
        });
    });

    it('Newly created freeform proposal details - shows full link included in description', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('8').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp).as('freeformProposal');
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Proposal submitted', epochTimeout).should('be.visible');
      cy.get(dialogCloseButton).click();
      cy.wait_for_proposal_sync();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.wait('@proposalSubmissionCompletion')
        .its(proposalResponseProposalIdPath)
        .then((proposalId) => {
          cy.get(openProposals).within(() => {
            cy.get(`#${proposalId}`)
              .within(() => {
                cy.get(viewProposalButton).should('be.visible').click();
              });
            })
          cy.get('@freeformProposal').then(freeformProposal => {
            // 1004-VOTE-055
            cy.get(proposalDetailsDescription)
              .should('contain', freeformProposal.rationale.description) 
              .and('have.attr', 'href')
              .and('equal', 'https://dweb.link/ipfs/bafybeigwwctpv37xdcwacqxvekr6e4kaemqsrv34em6glkbiceo3fcy4si')
              .and('be.visible')
          });
        });
    });

    it('Newly created freeform proposal details - shows open proposal in an open state', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('8').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Proposal submitted', epochTimeout).should('be.visible');
      cy.get(dialogCloseButton).click();
      cy.wait_for_proposal_sync();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.wait('@proposalSubmissionCompletion')
        .its(proposalResponseProposalIdPath)
        .then((proposalId) => {
          cy.get(openProposals).within(() => {
            cy.get(`#${proposalId}`)
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

    it('Newly created freeform proposal details - shows proposed and closing dates', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('9').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
          cy.get(newProposalSubmitButton).should('be.visible').click();

          cy.contains('Awaiting network confirmation', epochTimeout).should(
            'be.visible'
          );
          cy.contains('Proposal submitted', epochTimeout).should('be.visible');
          cy.get(dialogCloseButton).click();
          cy.wait_for_proposal_sync();
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
      // 1004-VOTE-043
      cy.contains('9 days left to vote').should('be.visible'); 
    });

    it('Newly created freeform proposal details - shows default status set to fail', function () {
      // 1004-VOTE-037
      // 1004-VOTE-039
      // 1004-VOTE-040
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('7').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Proposal submitted', epochTimeout).should('be.visible');
      cy.get(dialogCloseButton).click();
      cy.wait_for_proposal_sync();
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
      // 1004-VOTE-062
      cy.get_proposal_information_from_table('Majority met')
        .contains('👎')
        .should('be.visible');
      cy.get_proposal_information_from_table('Participation met')
        .contains('👎')
        .should('be.visible');
    });

    it('Newly created freeform proposal details - ability to vote for proposal - with minimum required tokens associated', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('7').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Proposal submitted', epochTimeout).should('be.visible');
      cy.get(dialogCloseButton).click();
      cy.wait_for_proposal_sync();
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
        // 1004-VOTE-051
        // 1004-VOTE-093
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
      // 1004-VOTE-061
      cy.get_proposal_information_from_table('Participation required')
        .contains(`${this.requiredParticipation}%`)
        .should('be.visible');
      // 1004-VOTE-066
      cy.get_proposal_information_from_table('Majority Required')
        .contains(`${parseFloat(this.requiredMajority).toFixed(2)}%`)
        .should('be.visible');
      cy.get_proposal_information_from_table('Number of voting parties')
        .should('have.text', '1')
        .and('be.visible');
    });

    it('Newly created freeform proposal details - ability to vote against proposal - with minimum required tokens associated', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('7').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Proposal submitted', epochTimeout).should('be.visible');
      cy.get(dialogCloseButton).click();
      cy.wait_for_proposal_sync();
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
        // 1004-VOTE-051
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

    it('Newly created freeform proposal details - ability to change vote from against to for - with minimum required tokens associated', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('7').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Proposal submitted', epochTimeout).should('be.visible');
      cy.get(dialogCloseButton).click();
      cy.wait_for_proposal_sync();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get_submitted_proposal_from_proposal_list()
        .as('submittedProposal')
        .within(() => cy.get(viewProposalButton).click());
      cy.vote_for_proposal('against');
      // 1004-VOTE-090
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
      // 1004-VOTE-064
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

    it('Newly created freeform proposal details - ability to change vote from for to against - with minimum required tokens associated', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('7').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Proposal submitted', epochTimeout).should('be.visible');
      cy.get(dialogCloseButton).click();
      cy.wait_for_proposal_sync();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get_submitted_proposal_from_proposal_list()
        .as('submittedProposal')
        .within(() => cy.get(viewProposalButton).click());
      cy.vote_for_proposal('for');
      cy.get(changeVoteButton).should('be.visible').click();
      cy.wait_for_spinner();
      // 1004-VOTE-080
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

    it('Newly created freeform proposal details - ability to increase associated tokens - so that vote sways result', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('7').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Proposal submitted', epochTimeout).should('be.visible');
      cy.get(dialogCloseButton).click();
      cy.wait_for_proposal_sync();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get_submitted_proposal_from_proposal_list()
        .as('submittedProposal')
        .within(() => cy.get(viewProposalButton).click());
      // 1004-VOTE-080
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
          // 1004-VOTE-065
          // 1004-VOTE-079
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
          cy.get_proposal_information_from_table('Will pass')
            .contains('👍')
            .should('be.visible');
          // 1004-VOTE-062
          cy.get_proposal_information_from_table('Majority met')
            .contains('👍')
            .should('be.visible');
          cy.get_proposal_information_from_table('Participation met')
            .contains('👍')
            .should('be.visible');
          // 1004-VOTE-042
          // 1004-VOTE-057
          // 1004-VOTE-058
          // 1004-VOTE-059
          // 1004-VOTE-060
          cy.contains('Currently set to pass').should('be.visible');
        });
    });

    it('Creating a proposal - proposal rejected - when closing time sooner than system default', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.create_ten_digit_unix_timestamp_for_specified_days(
        this.minCloseDays - 1
      ).then((closingDateTimestamp) => {
        cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
      });
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Proposal rejected', epochTimeout).should('be.visible');
      cy.get(dialogCloseButton).click();
      cy.wait_for_proposal_sync();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(rejectProposalsLink).click().wait_for_spinner();
      cy.get_submitted_proposal_from_proposal_list().within(() => {
        cy.contains('Rejected').should('be.visible');
        cy.contains('Close time too soon').should('be.visible');
      });
    });

    it('Creating a proposal - proposal rejected - when closing time later than system default', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.create_ten_digit_unix_timestamp_for_specified_days(
        this.maxCloseDays + 1
      ).then((closingDateTimestamp) => {
        cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
      });
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Proposal rejected', epochTimeout).should('be.visible');
      cy.get(dialogCloseButton).click();
      cy.wait_for_proposal_sync();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(rejectProposalsLink).click().wait_for_spinner();
      cy.get_submitted_proposal_from_proposal_list().within(() => {
        cy.contains('Rejected').should('be.visible');
        cy.contains('Close time too late').should('be.visible');
      });
    });

    it('Creating a proposal - proposal rejected - able to access rejected proposals', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.create_ten_digit_unix_timestamp_for_specified_days(
        this.maxCloseDays + 1
      ).then((closingDateTimestamp) => {
        cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
      });
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Proposal rejected', epochTimeout).should('be.visible');
      cy.get(dialogCloseButton).click();
      cy.wait_for_proposal_sync();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(rejectProposalsLink).click().wait_for_spinner();
      cy.get_submitted_proposal_from_proposal_list().within(() => {
        cy.contains('Rejected').should('be.visible');
        cy.contains('Close time too late').should('be.visible');
        cy.get(viewProposalButton).click();
      });
      cy.get_proposal_information_from_table('State')
        .contains('STATE_REJECTED')
        .and('be.visible');
      cy.get_proposal_information_from_table('Rejection reason')
        .contains('PROPOSAL_ERROR_CLOSE_TIME_TOO_LATE')
        .and('be.visible');
      cy.get_proposal_information_from_table('Error details')
        .contains('proposal closing time too late')
        .and('be.visible');
    });

    it('Unable to create a freeform proposal - when no tokens are associated', function () {
      cy.vega_wallet_teardown();
      cy.get(vegaWalletAssociatedBalance, txTimeout).contains(
        '0.000000000000000000',
        txTimeout
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('1').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();

      cy.contains('Transaction failed', epochTimeout).should('be.visible');
      cy.get(feedbackError)
        .contains(
          'Party has insufficient associated governance tokens in their staking account to submit proposal request'
        )
        .should('be.visible');
    });

    it('Unable to create a freeform proposal - when some but not enough tokens are associated', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance - 0.000001
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('1').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();

      cy.contains('Transaction failed', epochTimeout).should('be.visible');
      cy.get(feedbackError)
        .contains(
          'Party has insufficient associated governance tokens in their staking account to submit proposal request'
        )
        .should('be.visible');
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

        cy.wrap(freeformProposal)
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
        .its(proposalResponseProposalIdPath)
        .then((proposalId) => {
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
      cy.get(voteButtons).contains(vote).click();
      cy.contains('Casting vote...').should('be.visible');
      cy.contains('Casting vote...', txTimeout).should('not.exist');

      // below section temporary until #1090 fixed Casting vote in vegacapsule always says:
      // Something went wrong, and your vote was not seen by the network - despite vote success
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get('@submittedProposal').within(() =>
        cy.get(viewProposalButton).click()
      );
      cy.wait_for_spinner();
    });

    Cypress.Commands.add('wait_for_proposal_sync', () => {
      // This is a workaround function required because after posting a proposal
      // and waiting for the ProposalEvent network call to respond there can still be a few seconds
      // before proposal appears in the list - so rather than hard coded wait - we just wait on the
      // delegation checks that are performed on the governance page.

      cy.intercept('POST', '/query', (req) => {
        if (req.body.operationName === 'Delegations') {
          req.alias = 'proposalDelegationsCompletion';
        }
      });

      // waiting for two network calls
      cy.wait([
        '@proposalDelegationsCompletion',
        '@proposalDelegationsCompletion',
      ]);

      // Turn off this intercept from here on in
      cy.intercept('POST', '/query', (req) => {
        if (req.body.operationName === 'Delegations') {
          req.continue();
        }
      });
    });
  });
});
