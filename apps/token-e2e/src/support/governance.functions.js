const newProposalButton = '[data-testid="new-proposal-link"]';
const proposalInformationTableRows = '[data-testid="key-value-table-row"]';
const newProposalTitle = '[data-testid="proposal-title"]';
const newProposalDescription = '[data-testid="proposal-description"]';
const proposalDetails = '[data-testid="proposal-details"]';
const rawProposalData = '[data-testid="proposal-data"]';
const voteButtons = '[data-testid="vote-buttons"]';
const dialogTitle = '[data-testid="dialog-title"]';
const proposalVoteDeadline = '[data-testid="proposal-vote-deadline"]';
const dialogCloseButton = '[data-testid="dialog-close"]';
const epochTimeout = Cypress.env('epochTimeout');
const proposalTimeout = { timeout: 14000 };

Cypress.Commands.add(
  'convert_unix_timestamp_to_governance_data_table_date_format',
  (unixTimestamp, monthTextLength = 'longMonth') => {
    let dateSupplied = new Date(unixTimestamp * 1000),
      year = dateSupplied.getFullYear(),
      months = [
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
      ],
      month = months[dateSupplied.getMonth()],
      shortMonth = months[dateSupplied.getMonth()].substring(0, 3),
      date = dateSupplied.getDate();

    if (monthTextLength === 'longMonth') return `${date} ${month} ${year}`;
    else return `${date} ${shortMonth} ${year}`;
  }
);

Cypress.Commands.add(
  'create_ten_digit_unix_timestamp_for_specified_days',
  (durationDays) => {
    let today = new Date();
    let timestamp = today.setDate(today.getDate() + parseInt(durationDays));
    timestamp = Math.floor(timestamp / 1000);

    return timestamp;
  }
);

Cypress.Commands.add('enter_raw_proposal_body', (timestamp) => {
  cy.fixture('/proposals/raw.json').then((rawProposal) => {
    rawProposal.terms.closingTimestamp = timestamp;
    rawProposal.rationale.title += timestamp;
    let proposalPayload = JSON.stringify(rawProposal);

    cy.get(rawProposalData).type(proposalPayload, {
      parseSpecialCharSequences: false,
      delay: 2,
    });
    cy.wrap(rawProposal);
  });
});

Cypress.Commands.add(
  'enter_unique_freeform_proposal_body',
  (timestamp, proposalTitle) => {
    cy.get(newProposalTitle).type(proposalTitle);
    cy.get(newProposalDescription).type(
      'this is a e2e freeform proposal description'
    );
    cy.get(proposalVoteDeadline).clear().click().type(timestamp);
  }
);

Cypress.Commands.add(
  'get_submitted_proposal_from_proposal_list',
  (proposalTitle) => {
    cy.get_proposal_id_from_list(proposalTitle);
    cy.get('@proposalIdText').then((proposalId) => {
      return cy.get(`#${proposalId}`);
    });
  }
);

Cypress.Commands.add('get_proposal_id_from_list', (proposalTitle) => {
  cy.contains(proposalTitle)
    .parent()
    .parent()
    .parent()
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
});

Cypress.Commands.add(
  'get_governance_proposal_date_format_for_specified_days',
  (days, shortOrLong) => {
    cy.create_ten_digit_unix_timestamp_for_specified_days(days).then((date) => {
      cy.convert_unix_timestamp_to_governance_data_table_date_format(
        date,
        shortOrLong
      ).then((convertedDate) => {
        return convertedDate;
      });
    });
  }
);

Cypress.Commands.add('get_proposal_information_from_table', (heading) => {
  cy.get(proposalInformationTableRows).contains(heading).siblings();
});

Cypress.Commands.add('vote_for_proposal', (vote) => {
  cy.contains('Vote breakdown').should('be.visible', { timeout: 10000 });
  cy.get(voteButtons).contains(vote).click();
  cy.get(dialogTitle).should('have.text', 'Transaction complete');
  cy.get(dialogCloseButton).click();
});

Cypress.Commands.add('wait_for_proposal_sync', () => {
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
});

Cypress.Commands.add('navigate_to_page_if_not_already_loaded', (section) => {
  cy.url().then((url) => {
    if (url != `http://localhost:4210/${section}`) {
      cy.navigate_to(section);
    }
  });
});

Cypress.Commands.add('get_sort_order_of_supplied_array', (suppliedArray) => {
  const tempArray = [];
  for (let index = 1; index < suppliedArray.length; index++) {
    tempArray.push(
      suppliedArray[index - 1].localeCompare(suppliedArray[index])
    );
  }
  if (tempArray.every((n) => n <= 0)) return 'ascending';
  else if (tempArray.every((n) => n >= 0)) return 'descending';
  else return 'unsorted';
});

Cypress.Commands.add('go_to_make_new_proposal', (proposalType) => {
  cy.navigate_to_page_if_not_already_loaded('proposals');
  cy.get(newProposalButton).should('be.visible').click();
  cy.url().should('include', '/proposals/propose');
  cy.get('li').contains(proposalType).click();
});

Cypress.Commands.add('wait_for_proposal_submitted', () => {
  cy.contains('Awaiting network confirmation', epochTimeout).should(
    'be.visible'
  );
  cy.contains('Proposal submitted', proposalTimeout).should('be.visible');
  cy.get(dialogCloseButton).click();
});
