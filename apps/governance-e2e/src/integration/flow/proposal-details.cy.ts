import {
  navigateTo,
  waitForSpinner,
  navigation,
  turnTelemetryOff,
} from '../../support/common.functions';
import {
  createRawProposal,
  createTenDigitUnixTimeStampForSpecifiedDays,
  generateFreeFormProposalTitle,
  getDateFormatForSpecifiedDays,
  getProposalFromTitle,
  getProposalInformationFromTable,
  submitUniqueRawProposal,
  voteForProposal,
} from '../../../../governance-e2e/src/support/governance.functions';
import { ensureSpecifiedUnstakedTokensAreAssociated } from '../../../../governance-e2e/src/support/staking.functions';
import { ethereumWalletConnect } from '../../../../governance-e2e/src/support/wallet-eth.functions';
import { vegaWalletSetSpecifiedApprovalAmount } from '../../../../governance-e2e/src/support/wallet-teardown.functions';
import type { testFreeformProposal } from '../../support/common-interfaces';
import { formatDateWithLocalTimezone } from '@vegaprotocol/utils';

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
const proposalDescriptionToggle = 'proposal-description-toggle';
const voteBreakdownToggle = 'vote-breakdown-toggle';
const proposalTermsToggle = 'proposal-json-toggle';

describe(
  'Governance flow for proposal details',
  { tags: '@slow' },
  function () {
    before('connect wallets and set approval limit', function () {
      cy.visit('/');
      ethereumWalletConnect();
      cy.associateTokensToVegaWallet('1');
    });

    beforeEach('visit proposals tab', function () {
      cy.clearLocalStorage();
      turnTelemetryOff();
      cy.reload();
      waitForSpinner();
      cy.connectVegaWallet();
      ethereumWalletConnect();
      ensureSpecifiedUnstakedTokensAreAssociated('1');
      navigateTo(navigation.proposals);
    });

    // 3001-VOTE-050 3001-VOTE-054 3001-VOTE-055 3002-PROP-019
    it('Newly created raw proposal details - shows proposal title and full description', function () {
      const proposalDescription =
        'I propose that everyone evaluate the following IPFS document and vote Yes if they agree. bafybeigwwctpv37xdcwacqxvekr6e4kaemqsrv34em6glkbiceo3fcy4si';

      createRawProposal();
      cy.get<testFreeformProposal>('@rawProposal').then((rawProposal) => {
        cy.get(openProposals).within(() => {
          getProposalFromTitle(rawProposal.rationale.title).within(() => {
            cy.get(viewProposalButton).should('be.visible').click();
          });
        });
        cy.get(proposalDetailsTitle).should(
          'contain.text',
          rawProposal.rationale.title
        );
        cy.getByTestId(proposalDescriptionToggle).click();
        cy.getByTestId('proposal-description-toggle');
        cy.get(proposalDetailsDescription)
          .find('p')
          .should('have.text', proposalDescription);
      });
      // 3001-VOTE-008
      getProposalInformationFromTable('ID')
        .invoke('text')
        .should('not.be.empty')
        .and('have.length', 64);
      // 3001-VOTE-009
      getProposalInformationFromTable('Proposed by')
        .invoke('text')
        .should('not.be.empty')
        .and('have.length', 64);
      cy.getByTestId(proposalTermsToggle).click();
      // 3001-VOTE-052 3001-VOTE-010
      cy.get('code.language-json')
        .should('exist')
        .within(() => {
          cy.get('.hljs-attr').eq(0).should('have.text', '"id"');
        });
    });

    // 3001-VOTE-043
    it('Newly created freeform proposal details - shows proposed and closing dates', function () {
      const proposalTitle = generateFreeFormProposalTitle();
      const proposalTimeStamp = createTenDigitUnixTimeStampForSpecifiedDays(3);
      // const currentDate = new Date(createTenDigitUnixTimeStampForSpecifiedDays(0) * 1000)
      // const proposedDate = new Date(currentDate.getTime() + 60000)

      submitUniqueRawProposal({
        proposalTitle: proposalTitle,
        closingTimestamp: proposalTimeStamp,
      });
      navigateTo(navigation.proposals);
      getProposalFromTitle(proposalTitle).within(() =>
        cy.get(viewProposalButton).click()
      );
      cy.wrap(
        formatDateWithLocalTimezone(new Date(proposalTimeStamp * 1000))
      ).then((closingDate) => {
        getProposalInformationFromTable('Closes on').should(
          'have.text',
          closingDate
        );
      });
      getProposalInformationFromTable('Proposed on')
        .invoke('text')
        .should('not.be.empty');
    });

    it('Newly created proposal details - shows default status set to fail', function () {
      // 3001-VOTE-037
      // 3001-VOTE-040
      // 3001-VOTE-067
      createRawProposal();
      cy.get<testFreeformProposal>('@rawProposal').then((rawProposal) => {
        getProposalFromTitle(rawProposal.rationale.title).within(() =>
          cy.get(viewProposalButton).click()
        );
      });
      cy.contains('Participation: Not Met 0.00 0.00%(0.00% Required)').should(
        'be.visible'
      );
      cy.getByTestId(voteBreakdownToggle).click();
      getProposalInformationFromTable('Expected to pass')
        .contains('👎')
        .should('be.visible');
      // 3001-VOTE-062
      // 3001-VOTE-040
      // 3001-VOTE-070
      getProposalInformationFromTable('Token majority met')
        .contains('👎')
        .should('be.visible');
      // 3001-VOTE-068
      getProposalInformationFromTable('Token participation met')
        .contains('👎')
        .should('be.visible');
    });

    // 3001-VOTE-080 3001-VOTE-090 3001-VOTE-069 3001-VOTE-072 3001-VOTE-073
    it('Newly created proposal details - ability to vote for and against proposal - with minimum required tokens associated', function () {
      createRawProposal();
      cy.get<testFreeformProposal>('@rawProposal').then((rawProposal) => {
        getProposalFromTitle(rawProposal.rationale.title).within(() =>
          cy.get(viewProposalButton).click()
        );
      });
      // 3001-VOTE-080
      cy.getByTestId('vote-buttons').contains('against').should('be.visible');
      cy.getByTestId('vote-buttons').contains('for').should('be.visible');
      voteForProposal('for');
      getDateFormatForSpecifiedDays(0).then((votedDate) => {
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
      cy.getByTestId(voteBreakdownToggle).click();
      getProposalInformationFromTable('Tokens for proposal')
        .should('have.text', (1).toFixed(2))
        .and('be.visible');
      getProposalInformationFromTable('Tokens against proposal')
        .should('have.text', '0.00')
        .and('be.visible');
      // 3001-VOTE-061
      getProposalInformationFromTable('Participation required')
        .contains('0.00%')
        .should('be.visible');
      // 3001-VOTE-066
      getProposalInformationFromTable('Majority Required') // 3001-VOTE-073
        .contains(`${(66).toFixed(2)}%`)
        .should('be.visible');
      getProposalInformationFromTable('Number of voting parties')
        .should('have.text', '1')
        .and('be.visible');
      cy.get(changeVoteButton).should('be.visible').click();
      voteForProposal('for');
      // 3001-VOTE-064
      getProposalInformationFromTable('Tokens for proposal')
        .should('have.text', (1).toFixed(2))
        .and('be.visible');
      cy.get(changeVoteButton).should('be.visible').click();
      voteForProposal('against');
      cy.get(proposalVoteProgressAgainstPercentage)
        .contains('100.00%')
        .and('be.visible');
      getProposalInformationFromTable('Tokens against proposal')
        .should('have.text', (1).toFixed(2))
        .and('be.visible');
      getProposalInformationFromTable('Number of voting parties')
        .should('have.text', '1')
        .and('be.visible');
    });

    // 3001-VOTE-042, 3001-VOTE-057, 3001-VOTE-058, 3001-VOTE-059, 3001-VOTE-060
    it('Newly created proposal details - ability to increase associated tokens - by voting again after association', function () {
      vegaWalletSetSpecifiedApprovalAmount('1000');
      createRawProposal();
      cy.get<testFreeformProposal>('@rawProposal').then((rawProposal) => {
        getProposalFromTitle(rawProposal.rationale.title).within(() =>
          cy.get(viewProposalButton).click()
        );
      });
      voteForProposal('for');
      // 3001-VOTE-079
      cy.contains('You voted: For').should('be.visible');
      cy.get(proposalVoteProgressForTokens).contains('1').and('be.visible');
      cy.getByTestId(voteBreakdownToggle).click();
      getProposalInformationFromTable('Total Supply')
        .invoke('text')
        .then((totalSupply) => {
          const tokensRequiredToAchieveResult = (
            (Number(totalSupply.replace(/,/g, '')) * 0.001) /
            100
          ).toFixed(2);
          ethereumWalletConnect();
          ensureSpecifiedUnstakedTokensAreAssociated(
            tokensRequiredToAchieveResult
          );
          navigateTo(navigation.proposals);
          cy.get<testFreeformProposal>('@rawProposal').then((rawProposal) => {
            getProposalFromTitle(rawProposal.rationale.title).within(() =>
              cy.get(viewProposalButton).click()
            );
          });
          cy.get(proposalVoteProgressForPercentage)
            .contains('100.00%')
            .and('be.visible');
          cy.get(proposalVoteProgressAgainstPercentage)
            .contains('0.00%')
            .and('be.visible');
          // 3001-VOTE-065
          cy.get(changeVoteButton).should('be.visible').click();
          voteForProposal('for');
          cy.get(proposalVoteProgressForTokens)
            .contains(tokensRequiredToAchieveResult)
            .and('be.visible');
          cy.get(proposalVoteProgressAgainstTokens)
            .contains('0.00')
            .and('be.visible');
          cy.getByTestId(voteBreakdownToggle).click();
          getProposalInformationFromTable('Total tokens voted percentage')
            .should('have.text', '0.00%')
            .and('be.visible');
          getProposalInformationFromTable('Tokens for proposal')
            .should('have.text', tokensRequiredToAchieveResult)
            .and('be.visible');
          getProposalInformationFromTable('Tokens against proposal')
            .should('have.text', '0.00')
            .and('be.visible');
          getProposalInformationFromTable('Number of voting parties')
            .should('have.text', '1')
            .and('be.visible');
          getProposalInformationFromTable('Expected to pass')
            .contains('👍')
            .should('be.visible');
          // 3001-VOTE-062
          getProposalInformationFromTable('Token majority met')
            .contains('👍')
            .should('be.visible');
          getProposalInformationFromTable('Token participation met')
            .contains('👍')
            .should('be.visible');
          getProposalInformationFromTable('Tokens for proposal')
            .contains(tokensRequiredToAchieveResult)
            .and('be.visible');
        });
    });
  }
);
