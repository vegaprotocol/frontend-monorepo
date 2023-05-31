import { format } from 'date-fns';
import {
  closeDialog,
  navigateTo,
  navigation,
  waitForSpinner,
} from './common.functions';
import { ensureSpecifiedUnstakedTokensAreAssociated } from './staking.functions';

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
const epochTimeout = Cypress.env('epochTimeout');
const proposalTimeout = { timeout: 14000 };

export function createTenDigitUnixTimeStampForSpecifiedDays(
  durationDays: number
) {
  const today = new Date();
  let timestamp = today.setDate(today.getDate() + durationDays);
  return (timestamp = Math.floor(timestamp / 1000));
}

export function getDateFormatForSpecifiedDays(days: number) {
  const date = new Date(
    createTenDigitUnixTimeStampForSpecifiedDays(days) * 1000
  );
  return cy.wrap(format(date, 'dd MMM yyyy'));
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

export function submitUniqueRawProposal(proposalFields: {
  proposalBody?: string;
  proposalTitle?: string;
  proposalDescription?: string;
  closingTimestamp?: number;
  enactmentTimestamp?: number;
  submit?: boolean;
}) {
  goToMakeNewProposal(governanceProposalType.RAW);
  let proposalBodyPath = '/proposals/raw.json';
  if (proposalFields.proposalBody) {
    proposalBodyPath = proposalFields.proposalBody;
  }
  cy.readFile(proposalBodyPath).then((rawProposal) => {
    if (!proposalFields.proposalBody) {
      if (proposalFields.proposalTitle) {
        rawProposal.rationale.title = proposalFields.proposalTitle;
        cy.wrap(proposalFields.proposalTitle).as('proposalTitle');
      }
      if (proposalFields.proposalDescription) {
        rawProposal.rationale.description = proposalFields.proposalDescription;
      }
      if (proposalFields.closingTimestamp) {
        rawProposal.terms.closingTimestamp = proposalFields.closingTimestamp;
      } else {
        const minTimeStamp = createTenDigitUnixTimeStampForSpecifiedDays(2);
        rawProposal.terms.closingTimestamp = minTimeStamp;
      }
      if (proposalFields.enactmentTimestamp) {
        rawProposal.terms.enactmentTimestamp =
          proposalFields.enactmentTimestamp;
      }
    }

    const proposalPayload = JSON.stringify(rawProposal);
    cy.get(rawProposalData).type(proposalPayload, {
      parseSpecialCharSequences: false,
      delay: 2,
    });

    if (proposalFields.submit !== false) {
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.wrap(rawProposal).as('rawProposal');
      waitForProposalSubmitted();
      waitForProposalSync();
      navigateTo(navigation.proposals);
    }
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
  cy.getByTestId('proposal-download-json').should('be.visible').click();
}

export function getProposalFromTitle(proposalTitle: string) {
  return cy.contains(proposalTitle).parentsUntil(proposalListItem).last();
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
    .last()
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
  closeDialog();
}

export function waitForProposalSync() {
  // This is a workaround function required because after posting a proposal
  // and waiting for the ProposalEvent network call to respond there can still be a few seconds
  // before proposal appears in the list - so rather than hard coded wait - we just wait on the
  // delegation checks that are performed on the governance page.

  cy.intercept('POST', '/graphql', (req) => {
    if (req.body.operationName === 'Delegations') {
      req.alias = 'proposalDelegationsCompletion';
    }
  });

  // waiting for two network calls
  cy.wait(['@proposalDelegationsCompletion', '@proposalDelegationsCompletion']);

  // Turn off this intercept from here on in
  cy.intercept('POST', '/graphql', (req) => {
    if (req.body.operationName === 'Delegations') {
      req.continue();
    }
  });
}

export function goToMakeNewProposal(proposalType: governanceProposalType) {
  cy.visit('/proposals/propose');
  waitForSpinner();
  cy.url().should('include', '/proposals/propose');
  cy.get(navigation.pageSpinner, { timeout: 20000 }).should('not.exist');
  if (proposalType == governanceProposalType.RAW) {
    cy.get('[href="/proposals/propose/raw"]').click();
  } else {
    cy.get('li').should('contain.text', proposalType).and('be.visible');
    cy.get('li').contains(proposalType).click();
  }
}

// 3001-VOTE-013 3001-VOTE-014
export function waitForProposalSubmitted() {
  cy.contains('Awaiting network confirmation', epochTimeout).should(
    'be.visible'
  );
  cy.contains('Proposal submitted', proposalTimeout).should('be.visible');
  closeDialog();
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

export function getDownloadedProposalJsonPath(proposalType: string) {
  const downloadPath = './cypress/downloads/';
  const filepath = downloadPath + proposalType + getFormattedTime() + '.json';
  return filepath;
}

function getFormattedTime() {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = now.toLocaleString('en-US', { month: 'short' });
  const year = now.getFullYear().toString();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');

  return `${day}-${month}-${year}-${hours}-${minutes}`;
}

export enum governanceProposalType {
  NETWORK_PARAMETER = 'Network parameter',
  NEW_MARKET = 'New market',
  UPDATE_MARKET = 'Update market',
  NEW_ASSET = 'New asset',
  UPDATE_ASSET = 'Update asset',
  FREEFORM = 'Freeform',
  RAW = 'raw proposal',
}
