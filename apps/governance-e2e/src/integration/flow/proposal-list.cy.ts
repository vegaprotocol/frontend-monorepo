import type { testFreeformProposal } from '../../support/common-interfaces';
import {
  navigateTo,
  navigation,
  turnTelemetryOff,
  waitForSpinner,
} from '../../support/common.functions';
import {
  createRawProposal,
  createTenDigitUnixTimeStampForSpecifiedDays,
  enterRawProposalBody,
  generateFreeFormProposalTitle,
  getProposalFromTitle,
  getProposalInformationFromTable,
  goToMakeNewProposal,
  governanceProposalType,
  submitUniqueRawProposal,
  voteForProposal,
  waitForProposalSubmitted,
  waitForProposalSync,
} from '../../support/governance.functions';
import { ensureSpecifiedUnstakedTokensAreAssociated } from '../../support/staking.functions';
import { ethereumWalletConnect } from '../../support/wallet-eth.functions';
import { vegaWalletSetSpecifiedApprovalAmount } from '../../support/wallet-functions';

const proposalListItem = 'proposals-list-item';
const openProposals = 'open-proposals';
const voteStatus = 'vote-status';
const proposalType = 'proposal-type';
const proposalStatus = 'proposal-status';
const proposalClosingDate = 'vote-details';
const viewProposalButton = 'view-proposal-btn';
const voteBreakDownToggle = 'vote-breakdown-toggle';

describe('Governance flow for proposal list', { tags: '@slow' }, function () {
  before('connect wallets and set approval limit', function () {
    vegaWalletSetSpecifiedApprovalAmount('1000');
    cy.visit('/');
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
    cy.getByTestId(openProposals).within(() => {
      cy.getByTestId(proposalClosingDate)
        .first()
        .invoke('text')
        .should('match', /days|minutes/);
      cy.getByTestId(proposalClosingDate).should('contain.text', 'months');
      cy.getByTestId(proposalClosingDate).last().should('contain.text', 'year');
    });
  });

  it('Newly created proposals list - able to filter by proposerID to show it in list', function () {
    const proposerId = Cypress.env('vegaWalletPublicKey');
    const proposalTitle = generateFreeFormProposalTitle();

    submitUniqueRawProposal({ proposalTitle: proposalTitle });
    cy.get('[data-testid="set-proposals-filter-visible"]').click();
    cy.get('[data-testid="filter-input"]').type(proposerId);
    // cy.get(`#${proposalId}`).should('contain', proposalId);
    cy.contains(proposalTitle).should('be.visible');
    cy.get('[data-testid="filter-input"]').type('123');
    cy.getByTestId(proposalListItem).should('not.exist');
  });

  it('Newly created proposals list - shows title and portion of summary', function () {
    const proposalPath = 'src/fixtures/proposals/new-market-raw.json';
    const proposalTimestamp = createTenDigitUnixTimeStampForSpecifiedDays(3);
    submitUniqueRawProposal({
      proposalBody: proposalPath,
      enactmentTimestamp: proposalTimestamp,
      closingTimestamp: proposalTimestamp,
    }); // 3001-VOTE-052
    // 3001-VOTE-008
    // 3001-VOTE-034
    // 3001-VOTE-097
    cy.contains('New Market Proposal E2E submission');
    cy.contains('Code: TEST.24h. fBTC settled future.').should('be.visible');
  });

  it('Newly created proposals list - shows open proposals in an open state', function () {
    // 3001-VOTE-004
    // 3001-VOTE-035
    createRawProposal(this.minProposerBalance);
    cy.get<testFreeformProposal>('@rawProposal').then((rawProposal) => {
      getProposalFromTitle(rawProposal.rationale.title).within(() => {
        cy.getByTestId(viewProposalButton).should('be.visible');
        cy.getByTestId(proposalType).should('have.text', 'Freeform');
        cy.getByTestId(proposalStatus).should('have.text', 'Open');
      });
    });
  });

  // 3001-VOTE-071
  it('Newly created freeform proposals list - shows proposal participation - both met and not', function () {
    const proposalTitle = generateFreeFormProposalTitle();

    submitUniqueRawProposal({ proposalTitle: proposalTitle });
    getProposalFromTitle(proposalTitle).within(() => {
      // 3001-VOTE-039
      cy.getByTestId(voteStatus).should(
        'have.text',
        'Participation not reached'
      );
      cy.getByTestId(viewProposalButton).click();
    });
    voteForProposal('for');
    navigateTo(navigation.proposals);
    getProposalFromTitle(proposalTitle).within(() => {
      cy.getByTestId(voteStatus).should('have.text', 'Set to pass');
      cy.getByTestId(viewProposalButton).click();
    });
    cy.getByTestId(voteBreakDownToggle).click();
    getProposalInformationFromTable('Token participation met')
      .contains('👍')
      .should('be.visible');
  });
});
