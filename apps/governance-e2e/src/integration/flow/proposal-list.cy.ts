import type { testFreeformProposal } from '../../support/common-interfaces';
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

const openProposals = '[data-testid="open-proposals"]';
const voteStatus = '[data-testid="vote-status"]';
const proposalClosingDate = '[data-testid="vote-details"]';
const viewProposalButton = '[data-testid="view-proposal-btn"]';

describe('Governance flow for proposal list', { tags: '@slow' }, function () {
  before('connect wallets and set approval limit', function () {
    vegaWalletSetSpecifiedApprovalAmount('1000');
    cy.visit('/');
  });

  beforeEach('visit proposals tab', function () {
    cy.clearLocalStorage();
    cy.reload();
    waitForSpinner();
    cy.connectVegaWallet();
    ethereumWalletConnect();
    ensureSpecifiedUnstakedTokensAreAssociated('1');
    navigateTo(navigation.proposals);
  });

  it('Newly created proposals list - proposals closest to closing date appear higher in list', function () {
    // 3001-VOTE-005
    const proposalDays = [364, 50, 2];
    for (let index = 0; index < proposalDays.length; index++) {
      goToMakeNewProposal(governanceProposalType.RAW);
      enterRawProposalBody(
        createTenDigitUnixTimeStampForSpecifiedDays(proposalDays[index])
      );
      waitForProposalSubmitted();
      waitForProposalSync();
    }

    navigateTo(navigation.proposals);
    cy.get(openProposals).within(() => {
      cy.get(proposalClosingDate).first().should('contain.text', 'year');
      cy.get(proposalClosingDate).should('contain.text', 'months');
      cy.get(proposalClosingDate)
        .last()
        .invoke('text')
        .should('match', /days|minutes/);
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
    cy.get<testFreeformProposal>('@rawProposal').then((rawProposal) => {
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
    cy.get<testFreeformProposal>('@rawProposal').then((rawProposal) => {
      getSubmittedProposalFromProposalList(rawProposal.rationale.title).within(
        () => {
          cy.get(viewProposalButton).should('be.visible').click();
        }
      );

      cy.get('@proposalIdText').then((proposalId) => {
        getProposalInformationFromTable('ID')
          .contains(String(proposalId))
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

    createFreeformProposal(proposalTitle);
    getSubmittedProposalFromProposalList(proposalTitle).within(() => {
      // 3001-VOTE-039
      cy.get(voteStatus).should('have.text', 'Participation not reached');
      cy.get(viewProposalButton).click();
    });
    voteForProposal('for');
    navigateTo(navigation.proposals);
    getSubmittedProposalFromProposalList(proposalTitle).within(() => {
      cy.get(voteStatus).should('have.text', 'Set to pass');
      cy.get(viewProposalButton).click();
    });
    getProposalInformationFromTable('Token participation met')
      .contains('👍')
      .should('be.visible');
  });
});
