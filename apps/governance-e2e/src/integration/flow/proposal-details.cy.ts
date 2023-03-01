import {
  navigateTo,
  associateTokenStartOfTests,
  waitForSpinner,
  navigation,
} from '../../support/common.functions';
import {
  convertUnixTimestampToDateformat,
  createRawProposal,
  createTenDigitUnixTimeStampForSpecifiedDays,
  enterUniqueFreeFormProposalBody,
  generateFreeFormProposalTitle,
  getGovernanceProposalDateFormatForSpecifiedDays,
  getProposalIdFromList,
  getProposalInformationFromTable,
  getSubmittedProposalFromProposalList,
  goToMakeNewProposal,
  governanceProposalType,
  voteForProposal,
  waitForProposalSubmitted,
  waitForProposalSync,
} from '../../../../governance-e2e/src/support/governance.functions';
import { ensureSpecifiedUnstakedTokensAreAssociated } from '../../../../governance-e2e/src/support/staking.functions';
import { ethereumWalletConnect } from '../../../../governance-e2e/src/support/wallet-eth.functions';
import { vegaWalletSetSpecifiedApprovalAmount } from '../../../../governance-e2e/src/support/wallet-teardown.functions';

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
      vegaWalletSetSpecifiedApprovalAmount('1000');
      associateTokenStartOfTests();
    });

    beforeEach('visit proposals tab', function () {
      cy.reload();
      waitForSpinner();
      cy.connectVegaWallet();
      ethereumWalletConnect();
      ensureSpecifiedUnstakedTokensAreAssociated('1');
      navigateTo(navigation.proposals);
    });

    // 3001-VOTE-055
    it('Newly created raw proposal details - shows proposal title and full description', function () {
      createRawProposal();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cy.get('@rawProposal').then((rawProposal: any) => {
        getProposalIdFromList(rawProposal.rationale.title);
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
      const proposalTimeStamp = createTenDigitUnixTimeStampForSpecifiedDays(3);

      goToMakeNewProposal(governanceProposalType.FREEFORM);
      enterUniqueFreeFormProposalBody(closingVoteHrs, proposalTitle);
      waitForProposalSubmitted();
      waitForProposalSync();
      navigateTo(navigation.proposals);
      getSubmittedProposalFromProposalList(proposalTitle).within(() =>
        cy.get(viewProposalButton).click()
      );
      convertUnixTimestampToDateformat(proposalTimeStamp).then(
        (closingDate) => {
          getProposalInformationFromTable('Closes on')
            .contains(closingDate)
            .should('be.visible');
        }
      );
      getGovernanceProposalDateFormatForSpecifiedDays(0).then(
        (proposalDate) => {
          getProposalInformationFromTable('Proposed on')
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cy.get('@rawProposal').then((rawProposal: any) => {
        getSubmittedProposalFromProposalList(
          rawProposal.rationale.title
        ).within(() => cy.get(viewProposalButton).click());
      });
      cy.contains('Participation: Not Met 0.00 0.00%(0.00% Required)').should(
        'be.visible'
      );
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cy.get('@rawProposal').then((rawProposal: any) => {
        getSubmittedProposalFromProposalList(
          rawProposal.rationale.title
        ).within(() => cy.get(viewProposalButton).click());
      });
      // 3001-VOTE-080
      cy.getByTestId('vote-buttons').contains('against').should('be.visible');
      cy.getByTestId('vote-buttons').contains('for').should('be.visible');
      voteForProposal('for');
      getGovernanceProposalDateFormatForSpecifiedDays(0, 'shortMonth').then(
        (votedDate) => {
          // 3001-VOTE-051
          // 3001-VOTE-093
          cy.contains('You voted:')
            .siblings()
            .contains('For')
            .siblings()
            .contains(votedDate)
            .should('be.visible');
        }
      );
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
      createRawProposal();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cy.get('@rawProposal').then((rawProposal: any) => {
        getSubmittedProposalFromProposalList(rawProposal.rationale.title)
          .as('submittedProposal')
          .within(() => cy.get(viewProposalButton).click());
      });
      voteForProposal('for');
      // 3001-VOTE-079
      cy.contains('You voted: For').should('be.visible');
      cy.get(proposalVoteProgressForTokens).contains('1').and('be.visible');
      getProposalInformationFromTable('Total Supply')
        .invoke('text')
        .then((totalSupply) => {
          const tokensRequiredToAchieveResult = (
            (Number(totalSupply.replace(/,/g, '')) * 0.001) /
            100
          ).toFixed(2);
          ensureSpecifiedUnstakedTokensAreAssociated(
            tokensRequiredToAchieveResult
          );
          navigateTo(navigation.proposals);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          cy.get('@rawProposal').then((rawProposal: any) => {
            getSubmittedProposalFromProposalList(rawProposal.rationale.title)
              .as('submittedProposal')
              .within(() => cy.get(viewProposalButton).click());
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
