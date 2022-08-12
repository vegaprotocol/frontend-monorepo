/// <reference types="cypress" />
const newProposalButton = '[data-testid="new-proposal-link"]';
const newProposalDatabox = '[data-testid="proposal-data"]';
const newProposalSubmitButton = '[data-testid="proposal-submit"]';
const dialogCloseButton = '[data-testid="dialog-close"]';
const viewProposalButton = '[data-testid="view-proposal-btn"]';
const proposalInformationTableRows = '[data-testid="key-value-table-row"]';
const openProposals = '[data-testid="open-proposals"]';
const proposalHeader = '[data-testid="proposal-header"]';
const proposalStatus = '[data-testid="proposal-status"]';

context('Governance flow - with eth and vega wallets connected', function () {
  before('visit staking tab and connect vega wallet', function () {
    cy.vega_wallet_import();
    cy.visit('/');
    cy.verify_page_header('The $VEGA token');
    cy.vega_wallet_connect();
    cy.vega_wallet_set_specified_approval_amount('1000');
    cy.reload();
    cy.verify_page_header('The $VEGA token');
    cy.ethereum_wallet_connect();
  });

  describe('Eth wallet - contains VEGA tokens', function () {
    beforeEach(
      'teardown wallet & drill into a specific validator',
      function () {
        cy.navigate_to('staking');
        cy.wait_for_spinner();
      }
    );

    it('Able to submit a valid freeform proposal', function () {
      cy.staking_page_ensure_at_least_one_unstaked_token_is_associated();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.get(newProposalDatabox).click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('7').then(
        (closingDateTimestamp) => {
          cy.create_freeform_proposal(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Proposal submitted').should('be.visible');
      cy.get(dialogCloseButton).click();
    });

    it('Able to see new freeform proposals in an open state', function () {
      cy.staking_page_ensure_at_least_one_unstaked_token_is_associated();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.get(newProposalDatabox).click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('8').then(
        (closingDateTimestamp) => {
          cy.create_freeform_proposal(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Proposal submitted').should('be.visible');
      cy.get(dialogCloseButton).click();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(openProposals).within(() => {
        cy.get(proposalHeader)
          .first()
          .should('exist')
          .contains('Freeform proposal:')
          .should('be.visible');
        cy.get(proposalStatus)
          .first()
          .should('exist')
          .contains('Open')
          .should('be.visible');
      });
      cy.get(viewProposalButton).first().should('be.visible').click();
      cy.get(proposalInformationTableRows)
        .contains('State')
        .siblings()
        .contains('Open')
        .should('be.visible');
      cy.get(proposalInformationTableRows)
        .contains('Type')
        .siblings()
        .contains('NewFreeform');
    });

    it('Able to see new freeform proposal proposal and closing dates', function () {
      cy.staking_page_ensure_at_least_one_unstaked_token_is_associated();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.get(newProposalDatabox).click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('9').then(
        (closingDateTimestamp) => {
          cy.create_freeform_proposal(closingDateTimestamp);
          cy.get(newProposalSubmitButton).should('be.visible').click();
          cy.contains('Proposal submitted').should('be.visible');
          cy.get(dialogCloseButton).click();
          cy.navigate_to('governance');
          cy.wait_for_spinner();
          cy.get(viewProposalButton).first().should('be.visible').click();
          cy.convert_unix_timestamp_to_governance_data_table_date_format(
            closingDateTimestamp
          ).then((closingDate) => {
            cy.get(proposalInformationTableRows)
              .contains('Closes on')
              .siblings()
              .contains(closingDate)
              .should('be.visible');
          });
          cy.create_ten_digit_unix_timestamp_for_specified_days('0').then(
            (now) => {
              cy.convert_unix_timestamp_to_governance_data_table_date_format(
                now
              ).then((proposalDate) => {
                cy.get(proposalInformationTableRows)
                  .contains('Proposed on')
                  .siblings()
                  .contains(proposalDate)
                  .should('be.visible');
              });
            }
          );
          cy.contains('9 days left to vote').should('be.visible');
        }
      );
    });

    it('Able to see new freeform proposal unvoted status set to fail', function () {
      cy.staking_page_ensure_at_least_one_unstaked_token_is_associated();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.get(newProposalDatabox).click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('10').then(
        (closingDateTimestamp) => {
          cy.create_freeform_proposal(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Proposal submitted').should('be.visible');
      cy.get(dialogCloseButton).click();
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(viewProposalButton).first().should('be.visible').click();
      cy.contains('Currently set to fail').should('be.visible');
      cy.contains('Participation: Not Met 0.00 0.00%(0.00% Required)').should(
        'be.visible'
      );
      cy.get(proposalInformationTableRows)
        .contains('Will pass')
        .siblings()
        .contains('👎')
        .should('be.visible');
      cy.get(proposalInformationTableRows)
        .contains('Majority met')
        .siblings()
        .contains('👎')
        .should('be.visible');
      cy.get(proposalInformationTableRows)
        .contains('Participation met')
        .siblings()
        .contains('👎')
        .should('be.visible');
    });

    // it('Posting a proposal which has a closing time too soon - Proposal is rejected', function () {
    //   cy.staking_page_ensure_at_least_one_unstaked_token_is_associated();
    //   cy.vega_wallet_create_proposal_freeform('1')
    //     .then((proposal) => {
    //       expect(proposal.response).to.contain(
    //       'proposal closing time too soon'
    //       );
    //     });
    // });

    // it('Unable to create a freeform proposal without a token associated', function () {
    //   cy.staking_page_disassociate_all_tokens();

    //   cy.get(vegaWalletAssociatedBalance, txTimeout)
    //     .contains('0.000000000000000000', txTimeout);

    //   cy.vega_wallet_create_proposal_freeform('15').then((proposal) => {
    //     expect(proposal.response).to.contain(
    //       'party has insufficient tokens to submit proposal request in this epoch'
    //     );
    //   });
    // });

    Cypress.Commands.add(
      'convert_unix_timestamp_to_governance_data_table_date_format',
      (unix) => {
        let a = new Date(unix * 1000),
          year = a.getFullYear(),
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
          month = months[a.getMonth()],
          date = a.getDate();

        return `${date} ${month} ${year}`;
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

    Cypress.Commands.add('create_freeform_proposal', (timestamp) => {
      cy.fixture('/proposals/freeform.json').then((freeformProposal) => {
        // Adjust the payload with provided timestamp before posting
        freeformProposal.terms.closingTimestamp = timestamp;
        freeformProposal.rationale.description += timestamp;
        let proposalPayload = JSON.stringify(freeformProposal);

        cy.get(newProposalDatabox).type(proposalPayload, {
          parseSpecialCharSequences: false,
        });
      });
    });
  });
});
