import {
  createFreeformProposal,
  createRawProposal,
  generateFreeFormProposalTitle,
  governanceProposalType,
} from '../../support/governance.functions';

const proposalDetailsTitle = '[data-testid="proposal-title"]';
const openProposals = '[data-testid="open-proposals"]';
const voteStatus = '[data-testid="vote-status"]';
const viewProposalButton = '[data-testid="view-proposal-btn"]';

describe('Governance flow for proposal list', { tags: '@slow' }, function () {
  before('connect wallets and set approval limit', function () {
    cy.vega_wallet_set_specified_approval_amount('1000');
    cy.visit('/');
  });

  beforeEach('visit proposals tab', function () {
    cy.reload();
    cy.wait_for_spinner();
    cy.connectVegaWallet();
    cy.ethereum_wallet_connect();
    cy.ensure_specified_unstaked_tokens_are_associated(1);
    cy.navigate_to_page_if_not_already_loaded('proposals');
  });

  it('Newly created proposals list - proposals closest to closing date appear higher in list', function () {
    const minCloseDays = 2;
    const maxCloseDays = 3;

    // 3001-VOTE-005
    let proposalDays = [
      minCloseDays + 1,
      maxCloseDays,
      minCloseDays + 3,
      minCloseDays + 2,
    ];
    for (var index = 0; index < proposalDays.length; index++) {
      cy.go_to_make_new_proposal(governanceProposalType.RAW);
      cy.create_ten_digit_unix_timestamp_for_specified_days(
        proposalDays[index]
      ).then((closingDateTimestamp) => {
        cy.enter_raw_proposal_body(closingDateTimestamp);
      });
      cy.wait_for_proposal_submitted();
      cy.wait_for_proposal_sync();
    }

    let arrayOfProposals = [];

    cy.navigate_to('proposals');
    cy.get(proposalDetailsTitle)
      .each((proposalTitleElement) => {
        arrayOfProposals.push(proposalTitleElement.text());
      })
      .then(() => {
        cy.get_sort_order_of_supplied_array(arrayOfProposals).should(
          'equal',
          'descending'
        );
      });
  });

  it('Newly created proposals list - able to filter by proposerID to show it in list', function () {
    const proposerId = Cypress.env('vegaWalletPublicKey');
    const proposalTitle = generateFreeFormProposalTitle();

    createFreeformProposal(proposalTitle);
    cy.get_proposal_id_from_list(proposalTitle);
    cy.get('@proposalIdText').then((proposalId) => {
      cy.get('[data-testid="set-proposals-filter-visible"]').click();
      cy.get('[data-testid="filter-input"]').type(proposerId);
      cy.get(`#${proposalId}`).should('contain', proposalId);
    });
  });

  it('Newly created proposals list - shows title and portion of summary', function () {
    createRawProposal(this.minProposerBalance); // 3001-VOTE-052
    cy.get('@rawProposal').then((rawProposal) => {
      cy.get_proposal_id_from_list(rawProposal.rationale.title);
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
    cy.get('@rawProposal').then((rawProposal) => {
      cy.get_submitted_proposal_from_proposal_list(
        rawProposal.rationale.title
      ).within(() => {
        cy.get(viewProposalButton).should('be.visible').click();
      });
      cy.get('@proposalIdText').then((proposalId) => {
        cy.get_proposal_information_from_table('ID')
          .contains(proposalId)
          .and('be.visible');
      });
      cy.get_proposal_information_from_table('State')
        .contains('Open')
        .and('be.visible');
      cy.get_proposal_information_from_table('Type')
        .contains('Freeform')
        .and('be.visible');
    });
  });

  // 3001-VOTE-071
  it('Newly created freeform proposals list - shows proposal participation - both met and not', function () {
    const proposalTitle = generateFreeFormProposalTitle();
    const requiredParticipation = 0.001;

    createFreeformProposal(proposalTitle);

    cy.get_submitted_proposal_from_proposal_list(proposalTitle)
      .as('submittedProposal')
      .within(() => {
        // 3001-VOTE-039
        cy.get(voteStatus).should('have.text', 'Participation not reached');
        cy.get(viewProposalButton).click();
      });
    cy.vote_for_proposal('for');
    cy.get_proposal_information_from_table('Total Supply')
      .invoke('text')
      .then((totalSupply) => {
        let tokensRequiredToAchieveResult = parseFloat(
          (totalSupply.replace(/,/g, '') * requiredParticipation) / 100
        ).toFixed(2);
        cy.ensure_specified_unstaked_tokens_are_associated(
          tokensRequiredToAchieveResult
        );
        cy.navigate_to_page_if_not_already_loaded('proposals');
        cy.get('@submittedProposal').within(() =>
          cy.get(viewProposalButton).click()
        );
        cy.get_proposal_information_from_table('Token participation met')
          .contains('👍')
          .should('be.visible');
        cy.navigate_to('proposals');
        cy.get('@submittedProposal').within(() =>
          cy.get(voteStatus).should('have.text', 'Set to pass')
        );
      });
  });
});
