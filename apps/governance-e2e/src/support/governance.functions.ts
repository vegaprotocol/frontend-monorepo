import { navigateTo, navigation } from './common.functions';
import { ensureSpecifiedUnstakedTokensAreAssociated } from './staking.functions';

const newProposalButton = '[data-testid="new-proposal-link"]';
const proposalInformationTableRows = '[data-testid="key-value-table-row"]';
const proposalListItem = '[data-testid="proposals-list-item"]';
const newProposalTitle = '[data-testid="proposal-title"]';
const newProposalDescription = '[data-testid="proposal-description"]';
const proposalDetails = '[data-testid="proposal-details"]';
const rawProposalData = '[data-testid="proposal-data"]';
const voteButtons = '[data-testid="vote-buttons"]';
const dialogTitle = '[data-testid="dialog-title"]';
const proposalVoteDeadline = '[data-testid="proposal-vote-deadline"]';
const newProposalSubmitButton = '[data-testid="proposal-submit"]';
const dialogCloseButton = '[data-testid="dialog-close"]';
const epochTimeout = Cypress.env('epochTimeout');
const proposalTimeout = { timeout: 14000 };

export function convertUnixTimestampToDateformat(
  unixTimestamp: number,
  monthTextLength = 'longMonth'
) {
  const dateSupplied = new Date(unixTimestamp * 1000);
  const year = dateSupplied.getFullYear();
  const months = [
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
  ];
  const month = months[dateSupplied.getMonth()];
  const shortMonth = months[dateSupplied.getMonth()].substring(0, 3),
    date = dateSupplied.getDate();

  if (monthTextLength === 'longMonth') {
    return cy.wrap(`${date} ${month} ${year}`);
  } else return cy.wrap(`${date} ${shortMonth} ${year}`);
}

export function createTenDigitUnixTimeStampForSpecifiedDays(
  durationDays: number
) {
  const today = new Date();
  let timestamp = today.setDate(today.getDate() + durationDays);
  return (timestamp = Math.floor(timestamp / 1000));
}

export function enterRawProposalBody(timestamp: number) {
  cy.fixture('/proposals/raw.json').then((rawProposal) => {
    rawProposal.terms.closingTimestamp = timestamp;
    rawProposal.rationale.title += timestamp;
    const proposalPayload = JSON.stringify(rawProposal);

    cy.get(rawProposalData).type(proposalPayload, {
      parseSpecialCharSequences: false,
      delay: 2,
    });
    cy.get(newProposalSubmitButton).should('be.visible').click();
    cy.wrap(rawProposal).as('rawProposal');
  });
}

export function enterUniqueFreeFormProposalBody(
  timestamp: string,
  proposalTitle: string
) {
  cy.get(newProposalTitle).type(proposalTitle);
  cy.get(newProposalDescription).type(
    'this is a e2e freeform proposal description'
  );
  cy.get(proposalVoteDeadline).clear().click().type(timestamp);
  cy.getByTestId('proposal-submit').should('be.visible').click();
}

export function getSubmittedProposalFromProposalList(proposalTitle: string) {
  getProposalIdFromList(proposalTitle);
  cy.get('@proposalIdText').then((proposalId) => {
    cy.get(`#${proposalId}`).as('submittedProposal');
  });
  return cy.get('@submittedProposal');
}

export function getProposalIdFromList(proposalTitle: string) {
  cy.contains(proposalTitle)
    .parentsUntil(proposalListItem)
    .within(() => {
      cy.get(proposalDetails)
        .invoke('text')
        .then((proposalIdText) => {
          let newProposalId;
          if (proposalIdText.includes('Freeform proposal')) {
            newProposalId = proposalIdText.replace('Freeform proposal: ', '');
          }
          cy.wrap(newProposalId).as('proposalIdText');
        });
    });
}

export function getGovernanceProposalDateFormatForSpecifiedDays(
  days: number,
  shortOrLong?: string
) {
  return convertUnixTimestampToDateformat(
    createTenDigitUnixTimeStampForSpecifiedDays(days),
    shortOrLong
  );
}

export function getProposalInformationFromTable(heading: string) {
  return cy.get(proposalInformationTableRows).contains(heading).siblings();
}

export function voteForProposal(vote: string) {
  cy.contains('Vote breakdown').should('be.visible', { timeout: 10000 });
  cy.get(voteButtons).contains(vote).click();
  cy.get(dialogTitle, proposalTimeout).should(
    'have.text',
    'Transaction complete'
  );
  cy.get(dialogCloseButton).click();
}

export function waitForProposalSync() {
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
  cy.wait(['@proposalDelegationsCompletion', '@proposalDelegationsCompletion']);

  // Turn off this intercept from here on in
  cy.intercept('POST', '/query', (req) => {
    if (req.body.operationName === 'Delegations') {
      req.continue();
    }
  });
}

export function getSortOrderOfSuppliedArray(suppliedArray: string[]) {
  const tempArray = [];
  for (let index = 1; index < suppliedArray.length; index++) {
    tempArray.push(
      suppliedArray[index - 1].localeCompare(suppliedArray[index])
    );
  }
  if (tempArray.every((n) => n <= 0)) return 'ascending';
  else if (tempArray.every((n) => n >= 0)) return 'descending';
  else return 'unsorted';
}

export function goToMakeNewProposal(proposalType: string) {
  navigateTo(navigation.proposals);
  cy.get(newProposalButton).should('be.visible').click();
  cy.url().should('include', '/proposals/propose');
  cy.get('li').should('contain.text', proposalType).and('be.visible');
  cy.get('li').contains(proposalType).click();
}

export function waitForProposalSubmitted() {
  cy.contains('Awaiting network confirmation', epochTimeout).should(
    'be.visible'
  );
  cy.contains('Proposal submitted', proposalTimeout).should('be.visible');
  cy.get(dialogCloseButton).click();
}

export function createRawProposal(proposerBalance?: string) {
  if (proposerBalance) {
    ensureSpecifiedUnstakedTokensAreAssociated(proposerBalance);
  }

  goToMakeNewProposal(governanceProposalType.RAW);
  enterRawProposalBody(createTenDigitUnixTimeStampForSpecifiedDays(8));
  waitForProposalSubmitted();
  waitForProposalSync();
  navigateTo(navigation.proposals);
}

export function generateFreeFormProposalTitle() {
  const randomNum = Math.floor(Math.random() * 1000) + 1;
  return randomNum + ': Freeform e2e proposal';
}

export function createFreeformProposal(proposalTitle: string) {
  goToMakeNewProposal(governanceProposalType.FREEFORM);
  enterUniqueFreeFormProposalBody('50', proposalTitle);
  waitForProposalSubmitted();
  waitForProposalSync();
  cy.getByTestId('proposal-title').invoke('text').as('proposalTitle');
  navigateTo(navigation.proposals);
}

export const governanceProposalType = {
  NETWORK_PARAMETER: 'Network parameter',
  NEW_MARKET: 'New market',
  UPDATE_MARKET: 'Update market',
  NEW_ASSET: 'New asset',
  FREEFORM: 'Freeform',
  RAW: 'raw proposal',
};
