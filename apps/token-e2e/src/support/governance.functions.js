const newProposalButton = '[data-testid="new-proposal-link"]';
const proposalInformationTableRows = '[data-testid="key-value-table-row"]';
const newProposalTitle = '[data-testid="proposal-title"]';
const newProposalDescription = '[data-testid="proposal-description"]';
const proposalResponseProposalIdPath =
  'response.body.data.busEvents.0.event.id';
const voteButtons = '[data-testid="vote-buttons"]';
const txTimeout = Cypress.env('txTimeout');
const proposalVoteDeadline = '[data-testid="proposal-vote-deadline"]';
const useMinimum = '[data-testid="min-vote"]';

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

Cypress.Commands.add('enter_unique_freeform_proposal_body', (timestamp) => {
  cy.fixture('/proposals/freeform.json').then((freeformProposal) => {
    freeformProposal.terms.closingTimestamp = timestamp;
    freeformProposal.rationale.title += timestamp;
    let proposalPayload = JSON.stringify(freeformProposal);

    cy.get(newProposalTitle).type(freeformProposal.rationale.title);

    cy.get(newProposalDescription).type(proposalPayload, {
      parseSpecialCharSequences: false,
      delay: 2,
    });

    cy.get(proposalVoteDeadline).clear().click().type(timestamp);

    cy.wrap(freeformProposal);
  });
});

Cypress.Commands.add('get_network_parameters', () => {
  let mutation = '{networkParameters {key value}}';
  cy.request({
    method: 'POST',
    url: `http://localhost:3028/query`,
    body: {
      query: mutation,
    },
    headers: { 'content-type': 'application/json' },
  })
    .its(`body.data.networkParameters`)
    .then(function (response) {
      let object = response.reduce(function (r, e) {
        r[e.key] = e.value;
        return r;
      }, {});

      return object;
    });
});

Cypress.Commands.add('get_submitted_proposal_from_proposal_list', () => {
  cy.wait('@proposalSubmissionCompletion')
    .its(proposalResponseProposalIdPath)
    .then((proposalId) => {
      return cy.get(`#${proposalId}`);
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
  cy.contains('Casting vote...').should('be.visible');
  cy.contains('Casting vote...', txTimeout).should('not.exist');
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
      cy.wait_for_spinner();
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
  cy.get(newProposalButton).should('be.visible').click();
  cy.get('a.underline').contains(proposalType).click();
});
