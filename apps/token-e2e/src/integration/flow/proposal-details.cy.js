import { associateTokenStartOfTests } from '../../support/common.functions';
import {
  createRawProposal,
  generateFreeFormProposalTitle,
  governanceProposalType,
} from '../../support/governance.functions';

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
const openProposals = '[data-testid="open-proposals"]';
const viewProposalButton = '[data-testid="view-proposal-btn"]';

describe(
  'Governance flow for proposal details',
  { tags: '@slow' },
  function () {
    before('connect wallets and set approval limit', function () {
      cy.visit('/');
      cy.vega_wallet_set_specified_approval_amount('1000');
      associateTokenStartOfTests();
    });

    beforeEach('visit proposals tab', function () {
      cy.reload();
      cy.wait_for_spinner();
      cy.connectVegaWallet();
      cy.ethereum_wallet_connect();
      cy.ensure_specified_unstaked_tokens_are_associated(1);
      cy.navigate_to_page_if_not_already_loaded('proposals');
    });

    // 3001-VOTE-055
    it('Newly created raw proposal details - shows proposal title and full description', function () {
      createRawProposal();
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
      const proposalTitle = generateFreeFormProposalTitle();

      cy.go_to_make_new_proposal(governanceProposalType.FREEFORM);
      cy.create_ten_digit_unix_timestamp_for_specified_days('3').then(
        (closingDateTimestamp) => {
          cy.enter_unique_freeform_proposal_body(closingVoteHrs, proposalTitle);

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
      createRawProposal();
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
      createRawProposal();
      cy.get('@rawProposal').then((rawProposal) => {
        cy.get_submitted_proposal_from_proposal_list(
          rawProposal.rationale.title
        ).within(() => cy.get(viewProposalButton).click());
      });
      // 3001-VOTE-080
      cy.getByTestId('vote-buttons').contains('against').should('be.visible');
      cy.getByTestId('vote-buttons').contains('for').should('be.visible');
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
      cy.get(proposalVoteProgressForTokens).contains('1.00').and('be.visible');
      cy.get(proposalVoteProgressAgainstTokens)
        .contains('0.00')
        .and('be.visible');
      cy.get_proposal_information_from_table('Tokens for proposal')
        .should('have.text', parseFloat(1).toFixed(2))
        .and('be.visible');
      cy.get_proposal_information_from_table('Tokens against proposal')
        .should('have.text', '0.00')
        .and('be.visible');
      // 3001-VOTE-061
      cy.get_proposal_information_from_table('Participation required')
        .contains(0.001)
        .should('be.visible');
      // 3001-VOTE-066
      cy.get_proposal_information_from_table('Majority Required') // 3001-VOTE-073
        .contains(`${parseFloat(100).toFixed(2)}%`)
        .should('be.visible');
      cy.get_proposal_information_from_table('Number of voting parties')
        .should('have.text', '1')
        .and('be.visible');
      cy.get(changeVoteButton).should('be.visible').click();
      cy.vote_for_proposal('for');
      // 3001-VOTE-064
      cy.get_proposal_information_from_table('Tokens for proposal')
        .should('have.text', parseFloat(1).toFixed(2))
        .and('be.visible');
      cy.get(changeVoteButton).should('be.visible').click();
      cy.vote_for_proposal('against');
      cy.get(proposalVoteProgressAgainstPercentage)
        .contains('100.00%')
        .and('be.visible');
      cy.get_proposal_information_from_table('Tokens against proposal')
        .should('have.text', parseFloat(1).toFixed(2))
        .and('be.visible');
      cy.get_proposal_information_from_table('Number of voting parties')
        .should('have.text', '1')
        .and('be.visible');
    });

    // 3001-VOTE-042, 3001-VOTE-057, 3001-VOTE-058, 3001-VOTE-059, 3001-VOTE-060
    it('Newly created proposal details - ability to increase associated tokens - by voting again after association', function () {
      createRawProposal();
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
            (totalSupply.replace(/,/g, '') * 0.001) / 100
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
  }
);
