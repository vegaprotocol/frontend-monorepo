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
  let proposalBodyPath = 'src/fixtures/proposals/raw.json';
  if (proposalFields.proposalBody) {
    proposalBodyPath = proposalFields.proposalBody;
  }
  cy.readFile(proposalBodyPath).then((rawProposal) => {
    if (proposalFields.proposalTitle) {
      rawProposal.rationale.title = proposalFields.proposalTitle;
      cy.wrap(proposalFields.proposalTitle).as('proposalTitle');
    }
    if (proposalFields.proposalDescription) {
      rawProposal.rationale.description = proposalFields.proposalDescription;
    }
    if (proposalFields.closingTimestamp) {
      rawProposal.terms.closingTimestamp = proposalFields.closingTimestamp;
    } else if (
      !proposalFields.closingTimestamp &&
      !proposalFields.proposalBody
    ) {
      const minTimeStamp = createTenDigitUnixTimeStampForSpecifiedDays(2);
      rawProposal.terms.closingTimestamp = minTimeStamp;
    }
    if (proposalFields.enactmentTimestamp) {
      rawProposal.terms.enactmentTimestamp = proposalFields.enactmentTimestamp;
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
  cy.get(voteButtons).should('be.visible', { timeout: 10000 });
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

export function getProposalDetailsValue(RowName: string) {
  return cy
    .contains(RowName)
    .parentsUntil(proposalInformationTableRows)
    .parent()
    .first();
}

export function validateProposalDetailsDiff(
  RowName: string,
  changeType: proposalChangeType,
  newValue: string,
  oldValue?: string
) {
  getProposalDetailsValue(RowName).within(() => {
    cy.contains(changeType).should('be.visible');
    cy.contains(newValue).should('be.visible');
    if (oldValue) cy.contains(oldValue).should('have.class', 'line-through');
  });
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

export enum proposalChangeType {
  UPDATED = 'Updated',
  ADDED = 'Added',
}

export const longProposalDescription =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam bibendum orci augue, vel imperdiet augue ultrices sed. In hac habitasse platea dictumst. Sed eget elit vitae nisl tincidunt faucibus. Donec pellentesque mauris nec viverra blandit. Aenean eros diam, tempor eu luctus nec, rhoncus non massa. Mauris libero diam, mattis et enim ut, lobortis pharetra elit. Phasellus vel metus accumsan, rhoncus tellus finibus, blandit mi. In sollicitudin ex ac tortor ornare interdum. Sed est ipsum, vestibulum eget dolor vel, porta luctus elit. Fusce justo nibh, placerat eget sollicitudin eleifend, rhoncus id lorem. Fusce vitae magna vel urna faucibus accumsan quis id purus.\nPraesent convallis dolor sed ante ultricies tempor. Proin sed risus ut libero euismod semper. Duis quis quam sed lacus viverra blandit vel scelerisque diam. Donec interdum, ipsum eget imperdiet ornare, risus augue faucibus lectus, ullamcorper scelerisque erat sapien in purus. Nunc molestie tincidunt felis dignissim vestibulum. Quisque quis ornare enim, non dignissim lectus. Mauris mollis, massa ut maximus consectetur, sem mi lobortis quam, vel malesuada eros tortor nec ex. Cras ac nunc sed erat malesuada varius a quis nulla. Curabitur cursus nec sem sit amet aliquet. Ut tristique tortor neque, a dignissim lectus dictum vel. Praesent sollicitudin bibendum vulputate.\nAenean bibendum tristique diam laoreet posuere. Curabitur ornare lectus ut diam ultricies, ut sodales eros lacinia. Maecenas mauris turpis, gravida non arcu ac, interdum auctor sapien. Vestibulum sed tortor quam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec finibus pulvinar magna, non laoreet lectus molestie nec. Vestibulum tempus mattis vehicula. Praesent in orci lectus. In commodo sollicitudin lacus, et lobortis eros placerat vitae. Proin mi libero, feugiat id pretium posuere, rhoncus ut augue. Cras massa tortor, rutrum sed ex vitae, posuere pretium augue. Donec pellentesque suscipit dignissim. Vivamus convallis a odio vitae sodales. Nullam non eleifend mauris, sed iaculis lectus. Cras facilisis justo at ante.\n[Hyperlink text](https://dweb.link/ipfs/bafybeigwwctpv37xdcwacqxvekr6e4kaemqsrv34em6glkbiceo3fcy4si)';
