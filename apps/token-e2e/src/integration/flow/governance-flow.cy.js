/// <reference types="cypress" />

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
const openProposals = '[data-testid="open-proposals"]';
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
const rawProposalData = '[data-testid="proposal-data"]';
const minVoteButton = '[data-testid="min-vote"]';
const maxVoteButton = '[data-testid="max-vote"]';
const voteButtons = '[data-testid="vote-buttons"]';
const votingDate = '[data-testid="voting-date"]';
const voteTwoMinExtraNote = '[data-testid="voting-2-mins-extra"]';
const voteStatus = '[data-testid="vote-status"]';
const rejectProposalsLink = '[href="/proposals/rejected"]';
const feedbackError = '[data-testid="Error"]';
const noOpenProposals = '[data-testid="no-open-proposals"]';
const noClosedProposals = '[data-testid="no-closed-proposals"]';
const txTimeout = Cypress.env('txTimeout');
const epochTimeout = Cypress.env('epochTimeout');
const proposalTimeout = { timeout: 14000 };

const minCloseDays = 2;
const maxCloseDays = 3;
const requiredParticipation = 0.001;

const governanceProposalType = {
  NETWORK_PARAMETER: 'Network parameter',
  NEW_MARKET: 'New market',
  UPDATE_MARKET: 'Update market',
  NEW_ASSET: 'New asset',
  FREEFORM: 'Freeform',
  RAW: 'raw proposal',
};

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
        cy.wrap(
          network_parameters['governance.proposal.freeform.minClose'].split(
            'h'
          )[0]
        ).as('minCloseHours');
        cy.wrap(
          network_parameters['governance.proposal.freeform.maxClose'].split(
            'h'
          )[0]
        ).as('maxCloseHours');
      });
      cy.vega_wallet_set_specified_approval_amount('1000');
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
          // workaround for first eth tx hanging
          // associateTokenStartOfTests();
        }
      );

      beforeEach('visit governance tab', function () {
        cy.reload();
        cy.wait_for_spinner();
        cy.connectVegaWallet();
        cy.ethereum_wallet_connect();
        cy.navigate_to('proposals');
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
          `You must have at least ${this.minProposerBalance} VEGA associated to make a proposal`
        ).should('be.visible');
      });

      // 3002-PROP-011
      it('Able to submit a valid freeform proposal - with minimum required tokens associated', function () {
        cy.ensure_specified_unstaked_tokens_are_associated(
          this.minProposerBalance
        );
        cy.go_to_make_new_proposal(governanceProposalType.FREEFORM);
        cy.get(minVoteButton).should('be.visible'); // 3002-PROP-008
        cy.get(maxVoteButton).should('be.visible');
        cy.get(votingDate).should('not.be.empty');
        cy.get(voteTwoMinExtraNote).should(
          'contain.text',
          'we add 2 minutes of extra time'
        );
        cy.enter_unique_freeform_proposal_body('50', generateProposalTitle());
        cy.get(newProposalSubmitButton).should('be.visible').click();
        // 3002-PROP-012
        // 3002-PROP-016
        cy.wait_for_proposal_submitted();
      });

      it('Newly created proposals list - proposals closest to closing date appear higher in list', function () {
        // 3001-VOTE-005
        cy.ensure_specified_unstaked_tokens_are_associated(
          this.minProposerBalance
        );
        let proposalDays = [
          minCloseDays + 1,
          maxCloseDays,
          minCloseDays + 3,
          minCloseDays + 2,
        ];
        for (var index = 0; index < proposalDays.length; index++) {
          cy.go_to_make_new_proposal(governanceProposalType.RAW);
          cy.create_ten_digit_unix_timestamp_for_specified_days(
            proposalDays[index]
          ).then((closingDateTimestamp) => {
            cy.enter_raw_proposal_body(closingDateTimestamp);
          });
          cy.get(newProposalSubmitButton).should('be.visible').click();
          cy.contains('Awaiting network confirmation', epochTimeout).should(
            'be.visible'
          );
          cy.contains('Proposal submitted', proposalTimeout).should(
            'be.visible'
          );
          cy.get(dialogCloseButton).click();
          cy.wait_for_proposal_sync();
        }

        let arrayOfProposals = [];

        cy.navigate_to('proposals');
        cy.get(proposalDetailsTitle)
          .each((proposalTitleElement) => {
            arrayOfProposals.push(proposalTitleElement.text());
          })
          .then(() => {
            cy.get_sort_order_of_supplied_array(arrayOfProposals).should(
              'equal',
              'descending'
            );
          });
      });

      it('Able to submit a valid freeform proposal - with minimum required tokens associated - but also staked', function () {
        cy.ensure_specified_unstaked_tokens_are_associated('2');
        cy.navigate_to_page_if_not_already_loaded('proposals');
        cy.get(vegaWalletUnstakedBalance, txTimeout).should('contain', '2');
        cy.navigate_to('validators');
        cy.click_on_validator_from_list(0);
        cy.staking_validator_page_add_stake('2');
        cy.close_staking_dialog();

        cy.get(vegaWalletStakedBalances, txTimeout).should('contain', '2');

        cy.navigate_to('proposals');
        cy.go_to_make_new_proposal(governanceProposalType.FREEFORM);
        cy.enter_unique_freeform_proposal_body('50', generateProposalTitle());
        cy.get(newProposalSubmitButton).should('be.visible').click();
        cy.wait_for_proposal_submitted();
      });

      it('Newly created proposals list - able to filter by proposerID to show it in list', function () {
        const proposerId = Cypress.env('vegaWalletPublicKey');
        const proposalTitle = generateProposalTitle();

        createFreeformProposal(this.minProposerBalance, proposalTitle);
        cy.get_proposal_id_from_list(proposalTitle);
        cy.get('@proposalIdText').then((proposalId) => {
          cy.get('[data-testid="set-proposals-filter-visible"]').click();
          cy.get('[data-testid="filter-input"]').type(proposerId);
          cy.get(`#${proposalId}`).should('contain', proposalId);
        });
      });

      it('Newly created proposals list - shows title and portion of summary', function () {
        createRawProposal(this.minProposerBalance); // 3001-VOTE-052
        cy.get('@rawProposal').then((rawProposal) => {
          cy.get_proposal_id_from_list(rawProposal.rationale.title);
          cy.get('@proposalIdText').then((proposalId) => {
            cy.get(openProposals).within(() => {
              // 3001-VOTE-008
              // 3001-VOTE-034
              cy.get(`#${proposalId}`)
                // 3001-VOTE-097
                .should('contain', rawProposal.rationale.title)
                .and('be.visible');
              cy.get(`#${proposalId}`)
                .should(
                  'contain',
                  rawProposal.rationale.description.substring(0, 59)
                )
                .and('be.visible');
            });
          });
        });
      });

      it('Newly created proposals list - shows open proposals in an open state', function () {
        // 3001-VOTE-004
        // 3001-VOTE-035
        createRawProposal(this.minProposerBalance);
        cy.get('@rawProposal').then((rawProposal) => {
          cy.get_submitted_proposal_from_proposal_list(
            rawProposal.rationale.title
          ).within(() => {
            cy.get(viewProposalButton).should('be.visible').click();
          });
          cy.get('@proposalIdText').then((proposalId) => {
            cy.get_proposal_information_from_table('ID')
              .contains(proposalId)
              .and('be.visible');
          });
          cy.get_proposal_information_from_table('State')
            .contains('Open')
            .and('be.visible');
          cy.get_proposal_information_from_table('Type')
            .contains('Freeform')
            .and('be.visible');
        });
      });

      // 3001-VOTE-071
      it('Newly created freeform proposals list - shows proposal participation - both met and not', function () {
        const proposalTitle = generateProposalTitle();
        createFreeformProposal(this.minProposerBalance, proposalTitle);

        cy.get_submitted_proposal_from_proposal_list(proposalTitle)
          .as('submittedProposal')
          .within(() => {
            // 3001-VOTE-039
            cy.get(voteStatus).should('have.text', 'Participation not reached');
            cy.get(viewProposalButton).click();
          });
        cy.vote_for_proposal('for');
        cy.get_proposal_information_from_table('Total Supply')
          .invoke('text')
          .then((totalSupply) => {
            let tokensRequiredToAchieveResult = parseFloat(
              (totalSupply.replace(/,/g, '') * requiredParticipation) / 100
            ).toFixed(2);
            cy.ensure_specified_unstaked_tokens_are_associated(
              tokensRequiredToAchieveResult
            );
            cy.navigate_to_page_if_not_already_loaded('proposals');
            cy.get('@submittedProposal').within(() =>
              cy.get(viewProposalButton).click()
            );
            cy.get_proposal_information_from_table('Token participation met')
              .contains('👍')
              .should('be.visible');
            cy.navigate_to('proposals');
            cy.get('@submittedProposal').within(() =>
              cy.get(voteStatus).should('have.text', 'Set to pass')
            );
          });
      });

      // 3001-VOTE-055
      it('Newly created raw proposal details - shows proposal title and full description', function () {
        createRawProposal(this.minProposerBalance);
        cy.get('@rawProposal').then((rawProposal) => {
          cy.get_proposal_id_from_list(rawProposal.rationale.title);
          cy.get('@proposalIdText').then((proposalId) => {
            cy.get(openProposals).within(() => {
              cy.get(`#${proposalId}`).within(() => {
                cy.get(viewProposalButton).should('be.visible').click();
              });
            });
          });
          cy.get(proposalDetailsTitle)
            .should('contain', rawProposal.rationale.title)
            .and('be.visible');
          cy.get(proposalDetailsDescription)
            .should('contain', rawProposal.rationale.description)
            .and('be.visible');
        });
        // 3001-VOTE-052
        cy.get('code.language-json')
          .should('exist')
          .within(() => {
            cy.get('.hljs-string').eq(0).should('have.text', '"ProposalTerms"');
          });
      });

      // 3001-VOTE-043
      it('Newly created freeform proposal details - shows proposed and closing dates', function () {
        const closingVoteHrs = '72';
        const proposalTitle = generateProposalTitle();
        cy.ensure_specified_unstaked_tokens_are_associated(
          this.minProposerBalance
        );
        cy.go_to_make_new_proposal(governanceProposalType.FREEFORM);
        cy.create_ten_digit_unix_timestamp_for_specified_days('3').then(
          (closingDateTimestamp) => {
            cy.enter_unique_freeform_proposal_body(
              closingVoteHrs,
              proposalTitle
            );
            cy.get(newProposalSubmitButton).should('be.visible').click();

            cy.wait_for_proposal_submitted();
            cy.wait_for_proposal_sync();
            cy.navigate_to('proposals');
            cy.get_submitted_proposal_from_proposal_list(proposalTitle).within(
              () => cy.get(viewProposalButton).click()
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
      });

      it('Newly created proposal details - shows default status set to fail', function () {
        // 3001-VOTE-037
        // 3001-VOTE-040
        // 3001-VOTE-067
        createRawProposal(this.minProposerBalance);
        cy.get('@rawProposal').then((rawProposal) => {
          cy.get_submitted_proposal_from_proposal_list(
            rawProposal.rationale.title
          ).within(() => cy.get(viewProposalButton).click());
        });
        cy.contains('Participation: Not Met 0.00 0.00%(0.00% Required)').should(
          'be.visible'
        );
        cy.get_proposal_information_from_table('Expected to pass')
          .contains('👎')
          .should('be.visible');
        // 3001-VOTE-062
        // 3001-VOTE-040
        // 3001-VOTE-070
        cy.get_proposal_information_from_table('Token majority met')
          .contains('👎')
          .should('be.visible');
        // 3001-VOTE-068
        cy.get_proposal_information_from_table('Token participation met')
          .contains('👎')
          .should('be.visible');
      });

      // 3001-VOTE-080 3001-VOTE-090 3001-VOTE-069 3001-VOTE-072 3001-VOTE-073
      it('Newly created proposal details - ability to vote for and against proposal - with minimum required tokens associated', function () {
        createRawProposal(this.minProposerBalance);
        cy.get('@rawProposal').then((rawProposal) => {
          cy.get_submitted_proposal_from_proposal_list(
            rawProposal.rationale.title
          ).within(() => cy.get(viewProposalButton).click());
        });
        // 3001-VOTE-080
        cy.get(voteButtons).contains('against').should('be.visible');
        cy.get(voteButtons).contains('for').should('be.visible');
        cy.vote_for_proposal('for');
        cy.get_governance_proposal_date_format_for_specified_days(
          '0',
          'shortMonth'
        ).then((votedDate) => {
          // 3001-VOTE-051
          // 3001-VOTE-093
          cy.contains('You voted:')
            .siblings()
            .contains('For')
            .siblings()
            .contains(votedDate)
            .should('be.visible');
        });
        cy.get(proposalVoteProgressForPercentage) // 3001-VOTE-072
          .contains('100.00%')
          .and('be.visible');
        cy.get(proposalVoteProgressAgainstPercentage)
          .contains('0.00%')
          .and('be.visible');
        cy.get(proposalVoteProgressForTokens)
          .contains('1.00')
          .and('be.visible');
        cy.get(proposalVoteProgressAgainstTokens)
          .contains('0.00')
          .and('be.visible');
        cy.get_proposal_information_from_table('Tokens for proposal')
          .should('have.text', parseFloat(this.minProposerBalance).toFixed(2))
          .and('be.visible');
        cy.get_proposal_information_from_table('Tokens against proposal')
          .should('have.text', '0.00')
          .and('be.visible');
        // 3001-VOTE-061
        cy.get_proposal_information_from_table('Participation required')
          .contains(`${requiredParticipation}%`)
          .should('be.visible');
        // 3001-VOTE-066
        cy.get_proposal_information_from_table('Majority Required') // 3001-VOTE-073
          .contains(`${parseFloat(this.requiredMajority).toFixed(2)}%`)
          .should('be.visible');
        cy.get_proposal_information_from_table('Number of voting parties')
          .should('have.text', '1')
          .and('be.visible');
        cy.get(changeVoteButton).should('be.visible').click();
        cy.vote_for_proposal('for');
        // 3001-VOTE-064
        cy.get_proposal_information_from_table('Tokens for proposal')
          .should('have.text', parseFloat(this.minProposerBalance).toFixed(2))
          .and('be.visible');
        cy.get(changeVoteButton).should('be.visible').click();
        cy.vote_for_proposal('against');
        cy.get(proposalVoteProgressAgainstPercentage)
          .contains('100.00%')
          .and('be.visible');
        cy.get_proposal_information_from_table('Tokens against proposal')
          .should('have.text', parseFloat(this.minProposerBalance).toFixed(2))
          .and('be.visible');
        cy.get_proposal_information_from_table('Number of voting parties')
          .should('have.text', '1')
          .and('be.visible');
      });

      // 3001-VOTE-042, 3001-VOTE-057, 3001-VOTE-058, 3001-VOTE-059, 3001-VOTE-060
      it('Newly created proposal details - ability to increase associated tokens - by voting again after association', function () {
        createRawProposal(this.minProposerBalance);
        cy.get('@rawProposal').then((rawProposal) => {
          cy.get_submitted_proposal_from_proposal_list(
            rawProposal.rationale.title
          )
            .as('submittedProposal')
            .within(() => cy.get(viewProposalButton).click());
        });
        cy.vote_for_proposal('for');
        // 3001-VOTE-079
        cy.contains('You voted: For').should('be.visible');
        cy.get(proposalVoteProgressForTokens).contains('1').and('be.visible');
        cy.get_proposal_information_from_table('Total Supply')
          .invoke('text')
          .then((totalSupply) => {
            let tokensRequiredToAchieveResult = parseFloat(
              (totalSupply.replace(/,/g, '') * requiredParticipation) / 100
            ).toFixed(2);
            cy.ensure_specified_unstaked_tokens_are_associated(
              tokensRequiredToAchieveResult
            );
            cy.navigate_to_page_if_not_already_loaded('proposals');
            cy.get('@submittedProposal').within(() =>
              cy.get(viewProposalButton).click()
            );
            cy.get(proposalVoteProgressForPercentage)
              .contains('100.00%')
              .and('be.visible');
            cy.get(proposalVoteProgressAgainstPercentage)
              .contains('0.00%')
              .and('be.visible');
            // 3001-VOTE-065
            cy.get(changeVoteButton).should('be.visible').click();
            cy.vote_for_proposal('for');
            cy.get(proposalVoteProgressForTokens)
              .contains(tokensRequiredToAchieveResult)
              .and('be.visible');
            cy.get(proposalVoteProgressAgainstTokens)
              .contains('0.00')
              .and('be.visible');
            cy.get_proposal_information_from_table(
              'Total tokens voted percentage'
            )
              .should('have.text', '0.00%')
              .and('be.visible');
            cy.get_proposal_information_from_table('Tokens for proposal')
              .should('have.text', tokensRequiredToAchieveResult)
              .and('be.visible');
            cy.get_proposal_information_from_table('Tokens against proposal')
              .should('have.text', '0.00')
              .and('be.visible');
            cy.get_proposal_information_from_table('Number of voting parties')
              .should('have.text', '1')
              .and('be.visible');
            cy.get_proposal_information_from_table('Expected to pass')
              .contains('👍')
              .should('be.visible');
            // 3001-VOTE-062
            cy.get_proposal_information_from_table('Token majority met')
              .contains('👍')
              .should('be.visible');
            cy.get_proposal_information_from_table('Token participation met')
              .contains('👍')
              .should('be.visible');
            cy.get_proposal_information_from_table('Tokens for proposal')
              .contains(tokensRequiredToAchieveResult)
              .and('be.visible');
          });
      });

      it('Creating a proposal - proposal rejected - when closing time sooner than system default', function () {
        cy.ensure_specified_unstaked_tokens_are_associated(
          this.minProposerBalance
        );
        cy.go_to_make_new_proposal(governanceProposalType.FREEFORM);
        cy.enter_unique_freeform_proposal_body('40', generateProposalTitle());
        cy.get(newProposalSubmitButton).should('be.visible').click();
        cy.contains('Awaiting network confirmation', epochTimeout).should(
          'not.exist'
        );
      });

      it('Creating a proposal - proposal rejected - when closing time later than system default', function () {
        cy.ensure_specified_unstaked_tokens_are_associated(
          this.minProposerBalance
        );
        cy.go_to_make_new_proposal(governanceProposalType.FREEFORM);
        cy.enter_unique_freeform_proposal_body(
          '100000',
          generateProposalTitle()
        );
        cy.get(newProposalSubmitButton).should('be.visible').click();
        cy.contains('Awaiting network confirmation', epochTimeout).should(
          'not.exist'
        );
      });

      // 3001-VOTE-006
      it('Creating a proposal - proposal rejected - able to access rejected proposals', function () {
        cy.ensure_specified_unstaked_tokens_are_associated(
          this.minProposerBalance
        );
        cy.go_to_make_new_proposal(governanceProposalType.RAW);
        cy.create_ten_digit_unix_timestamp_for_specified_days('1000').then(
          (closingDateTimestamp) => {
            cy.enter_raw_proposal_body(closingDateTimestamp).as('rawProposal');
          }
        );
        cy.get(newProposalSubmitButton).should('be.visible').click();
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
        cy.get(newProposalSubmitButton).should('be.visible').click();
        cy.contains('Transaction failed', proposalTimeout).should('be.visible');
        cy.get(feedbackError).should(
          'have.text',
          'Network error: the network blocked the transaction through the spam protection'
        );
        cy.get(dialogCloseButton).click();
      });

      // 3002-PROP-009
      it('Unable to create a proposal - when some but not enough tokens are associated', function () {
        cy.ensure_specified_unstaked_tokens_are_associated(
          this.minProposerBalance - 0.000001
        );
        cy.go_to_make_new_proposal(governanceProposalType.RAW);
        cy.create_ten_digit_unix_timestamp_for_specified_days('8').then(
          (closingDateTimestamp) => {
            cy.enter_raw_proposal_body(closingDateTimestamp);
          }
        );
        cy.get(newProposalSubmitButton).should('be.visible').click();
        cy.contains('Transaction failed', proposalTimeout).should('be.visible');
        cy.get(feedbackError).should(
          'have.text',
          'Network error: the network blocked the transaction through the spam protection'
        );
        cy.get(dialogCloseButton).click();
      });

      it('Unable to create a freeform proposal - when json parent section contains unexpected field', function () {
        // 3001-VOTE-038 3002-PROP-013 3002-PROP-014
        cy.ensure_specified_unstaked_tokens_are_associated(
          this.minProposerBalance
        );
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
        cy.ensure_specified_unstaked_tokens_are_associated(
          this.minProposerBalance
        );
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
      it.skip(
        'Unable to vote on a freeform proposal - when some but not enough vega associated',
        { tags: '@smoke' },
        function () {
          const proposalTitle = generateProposalTitle();

          cy.vega_wallet_teardown();
          cy.ensure_specified_unstaked_tokens_are_associated(
            this.minProposerBalance
          );
          cy.go_to_make_new_proposal(governanceProposalType.FREEFORM);
          cy.enter_unique_freeform_proposal_body('50', proposalTitle);
          cy.get(newProposalSubmitButton).should('be.visible').click();
          cy.wait_for_proposal_submitted();
          cy.staking_page_disassociate_tokens('0.0001');
          cy.get(vegaWallet).within(() => {
            cy.get(vegaWalletAssociatedBalance, txTimeout).should(
              'contain',
              '0.9999'
            );
          });
          cy.navigate_to('proposals');
          cy.get_submitted_proposal_from_proposal_list(proposalTitle).within(
            () => cy.get(viewProposalButton).click()
          );
          cy.contains('Vote breakdown').should('be.visible', {
            timeout: 10000,
          });
          cy.get(voteButtons).should('not.exist');
          cy.getByTestId('min-proposal-requirements').should(
            'have.text',
            `You must have at least ${this.minVoterBalance} VEGA associated to vote on this proposal`
          );
        }
      );

      it('Unable to vote on a proposal - when vega wallet disconnected - option to connect from within', function () {
        createRawProposal(this.minProposerBalance);
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

      function createRawProposal(proposerBalance) {
        if (proposerBalance)
          cy.ensure_specified_unstaked_tokens_are_associated(proposerBalance);
        cy.go_to_make_new_proposal(governanceProposalType.RAW);
        cy.create_ten_digit_unix_timestamp_for_specified_days('8').then(
          (closingDateTimestamp) => {
            cy.enter_raw_proposal_body(closingDateTimestamp).as('rawProposal');
          }
        );
        cy.get(newProposalSubmitButton).should('be.visible').click();
        cy.wait_for_proposal_submitted();
        cy.wait_for_proposal_sync();
        cy.navigate_to('proposals');
      }

      function createFreeformProposal(proposerBalance, proposalTitle) {
        cy.ensure_specified_unstaked_tokens_are_associated(proposerBalance);
        cy.go_to_make_new_proposal(governanceProposalType.FREEFORM);
        cy.enter_unique_freeform_proposal_body('50', proposalTitle);
        cy.get(newProposalSubmitButton).should('be.visible').click();
        cy.wait_for_proposal_submitted();
        cy.wait_for_proposal_sync();
        cy.get(proposalDetailsTitle).invoke('text').as('proposalTitle');
        cy.navigate_to('proposals');
      }

      function generateProposalTitle() {
        const randomNum = Math.floor(Math.random() * 1000) + 1;
        return randomNum + ': Freeform e2e proposal';
      }

      // This is a workaround function to begin tests with associating tokens without failing
      // Should be removed when eth transaction bug is fixed
      function associateTokenStartOfTests() {
        cy.highlight(`Associating tokens for first time`);
        cy.ethereum_wallet_connect();
        cy.connectVegaWallet();
        cy.get('[href="/token/associate"]').first().click();
        cy.getByTestId('associate-radio-wallet', { timeout: 30000 }).click();
        cy.getByTestId('token-amount-input', epochTimeout).type('1');
        cy.getByTestId('token-input-submit-button', txTimeout)
          .should('be.enabled')
          .click();
        cy.contains(
          `Associating with Vega key. Waiting for ${Cypress.env(
            'blockConfirmations'
          )} more confirmations..`,
          txTimeout
        ).should('be.visible');
        cy.getByTestId('associated-amount', txTimeout).should(
          'contain.text',
          '1'
        );
        // Wait is needed to allow time for transaction to complete
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(10000);
        cy.vega_wallet_teardown();
        cy.clearLocalStorage();
      }
    });
  }
);
