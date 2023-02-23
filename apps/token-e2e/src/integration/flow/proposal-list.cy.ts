import {
  navigateTo,
  navigation,
  waitForSpinner,
} from '../../support/common.functions';
import {
  createFreeformProposal,
  createRawProposal,
  createTenDigitUnixTimeStampForSpecifiedDays,
  enterRawProposalBody,
  generateFreeFormProposalTitle,
  getProposalIdFromList,
  getProposalInformationFromTable,
  getSortOrderOfSuppliedArray,
  getSubmittedProposalFromProposalList,
  goToMakeNewProposal,
  governanceProposalType,
  voteForProposal,
  waitForProposalSubmitted,
  waitForProposalSync,
} from '../../support/governance.functions';
import { ensureSpecifiedUnstakedTokensAreAssociated } from '../../support/staking.functions';
import { ethereumWalletConnect } from '../../support/wallet-eth.functions';
import { vegaWalletSetSpecifiedApprovalAmount } from '../../support/wallet-teardown.functions';

const proposalDetailsTitle = '[data-testid="proposal-title"]';
const openProposals = '[data-testid="open-proposals"]';
const voteStatus = '[data-testid="vote-status"]';
const viewProposalButton = '[data-testid="view-proposal-btn"]';

describe('Governance flow for proposal list', { tags: '@slow' }, function () {
  before('connect wallets and set approval limit', function () {
    vegaWalletSetSpecifiedApprovalAmount('1000');
    cy.visit('/');
  });

  beforeEach('visit proposals tab', function () {
    cy.reload();
    waitForSpinner();
    cy.connectVegaWallet();
    ethereumWalletConnect();
    ensureSpecifiedUnstakedTokensAreAssociated('1');
    navigateTo(navigation.proposals);
  });

  it('Newly created proposals list - proposals closest to closing date appear higher in list', function () {
    const minCloseDays = 2;
    const maxCloseDays = 3;

    // 3001-VOTE-005
    const proposalDays = [
      minCloseDays + 1,
      maxCloseDays,
      minCloseDays + 3,
      minCloseDays + 2,
    ];
    for (let index = 0; index < proposalDays.length; index++) {
      goToMakeNewProposal(governanceProposalType.RAW);
      enterRawProposalBody(
        createTenDigitUnixTimeStampForSpecifiedDays(proposalDays[index])
      );
      waitForProposalSubmitted();
      waitForProposalSync();
    }

    const arrayOfProposals: string[] = [];

    navigateTo(navigation.proposals);
    cy.get(proposalDetailsTitle)
      .each((proposalTitleElement) => {
        arrayOfProposals.push(proposalTitleElement.text());
      })
      .then(() => {
        cy.wrap(getSortOrderOfSuppliedArray(arrayOfProposals)).should(
          'equal',
          'descending'
        );
      });
  });

  it('Newly created proposals list - able to filter by proposerID to show it in list', function () {
    const proposerId = Cypress.env('vegaWalletPublicKey');
    const proposalTitle = generateFreeFormProposalTitle();

    createFreeformProposal(proposalTitle);
    getProposalIdFromList(proposalTitle);
    cy.get('@proposalIdText').then((proposalId) => {
      cy.get('[data-testid="set-proposals-filter-visible"]').click();
      cy.get('[data-testid="filter-input"]').type(proposerId);
      cy.get(`#${proposalId}`).should('contain', proposalId);
    });
  });

  it('Newly created proposals list - shows title and portion of summary', function () {
    createRawProposal(this.minProposerBalance); // 3001-VOTE-052
    cy.get('@rawProposal').then((rawProposal: any) => {
      getProposalIdFromList(rawProposal.rationale.title);
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
    cy.get('@rawProposal').then((rawProposal: any) => {
      getSubmittedProposalFromProposalList(rawProposal.rationale.title).within(
        () => {
          cy.get(viewProposalButton).should('be.visible').click();
        }
      );
      cy.get('@proposalIdText').then((proposalId: any) => {
        getProposalInformationFromTable('ID')
          .contains(proposalId)
          .and('be.visible');
      });
      getProposalInformationFromTable('State')
        .contains('Open')
        .and('be.visible');
      getProposalInformationFromTable('Type')
        .contains('Freeform')
        .and('be.visible');
    });
  });

  // 3001-VOTE-071
  it('Newly created freeform proposals list - shows proposal participation - both met and not', function () {
    const proposalTitle = generateFreeFormProposalTitle();
    const requiredParticipation = 0.001;

    createFreeformProposal(proposalTitle);

    getSubmittedProposalFromProposalList(proposalTitle)
      .as('submittedProposal')
      .within(() => {
        // 3001-VOTE-039
        cy.get(voteStatus).should('have.text', 'Participation not reached');
        cy.get(viewProposalButton).click();
      });
    voteForProposal('for');
    getProposalInformationFromTable('Total Supply')
      .invoke('text')
      .then((totalSupply) => {
        const tokensRequiredToAchieveResult = (
          (Number(totalSupply.replace(/,/g, '')) * requiredParticipation) /
          100
        ).toFixed(2);
        ensureSpecifiedUnstakedTokensAreAssociated(
          tokensRequiredToAchieveResult
        );
        navigateTo(navigation.proposals);
        cy.get('@submittedProposal').within(() =>
          cy.get(viewProposalButton).click()
        );
        getProposalInformationFromTable('Token participation met')
          .contains('👍')
          .should('be.visible');
        navigateTo(navigation.proposals);
        cy.get('@submittedProposal').within(() =>
          cy.get(voteStatus).should('have.text', 'Set to pass')
        );
      });
  });
});
