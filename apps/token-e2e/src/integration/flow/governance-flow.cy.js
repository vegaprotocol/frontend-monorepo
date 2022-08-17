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
const vegaWalletAssociatedBalance = '[data-testid="currency-value"]';
const txTimeout = Cypress.env('txTimeout');

context('Governance flow - with eth and vega wallets connected', function () {
  before('connect wallets and set approval limit', function () {
    cy.vega_wallet_import();
    cy.visit('/');
    cy.verify_page_header('The $VEGA token');
    cy.get_network_parameters().then((network_parameters) => {
      cy.wrap(
        network_parameters['governance.proposal.freeform.minProposerBalance']
      ).as('minProposerBalance');
      cy.wrap(
        network_parameters['governance.proposal.freeform.minClose'].split(
          'h'
        )[0] / 24
      ).as('minCloseDays');
      cy.wrap(
        network_parameters['governance.proposal.freeform.maxClose'].split(
          'h'
        )[0] / 24
      ).as('maxCloseDays');
    });
    cy.vega_wallet_connect();
    cy.vega_wallet_set_specified_approval_amount('1000');
    cy.reload();
    cy.verify_page_header('The $VEGA token');
    cy.ethereum_wallet_connect();
  });

  describe('Eth wallet - contains VEGA tokens', function () {
    beforeEach('visit staking tab', function () {
      cy.navigate_to('staking');
      cy.wait_for_spinner();
    });

    it('Able to submit a valid freeform proposal - with minimum tokens associated - positive feedback', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
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

    it('Able to see a newly created freeform proposal - in an open state', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
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

    it('Able to see a newly created freeform proposal - proposed and closing dates', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
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

    it('Able to see a newly created freeform proposal - default status set to fail', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
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

    it('Unable to create a proposal - which has a closing time earlier than system default', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.get(newProposalDatabox).click();
      cy.create_ten_digit_unix_timestamp_for_specified_days(
        this.minCloseDays - 1
      ).then((closingDateTimestamp) => {
        cy.create_freeform_proposal(closingDateTimestamp);
      });
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Proposal rejected').should('be.visible');
      cy.get(dialogCloseButton).click();
    });

    it('Unable to create a proposal - which has a closing time later than system default', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.get(newProposalDatabox).click();
      cy.create_ten_digit_unix_timestamp_for_specified_days(
        this.maxCloseDays + 1
      ).then((closingDateTimestamp) => {
        cy.create_freeform_proposal(closingDateTimestamp);
      });
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Proposal rejected').should('be.visible');
      cy.get(dialogCloseButton).click();
    });

    it.skip('Unable to create a freeform proposal - when no tokens are associated', function () {
      cy.vega_wallet_teardown();
      cy.get(vegaWalletAssociatedBalance, txTimeout).contains(
        '0.000000000000000000',
        txTimeout
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.get(newProposalDatabox).click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('1').then(
        (closingDateTimestamp) => {
          cy.create_freeform_proposal(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains(
        'party has insufficient tokens to submit proposal request in this epoch'
      ).should('be.visible');
      cy.get(dialogCloseButton).click();
    });

    it.skip('Unable to create a freeform proposal - when some but not enough tokens are associated', function () {
      cy.vega_wallet_teardown();
      cy.get(vegaWalletAssociatedBalance, txTimeout).contains(
        '0.000000000000000000',
        txTimeout
      );
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance - 0.1
      );
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.get(newProposalButton).should('be.visible').click();
      cy.get(newProposalDatabox).click();
      cy.create_ten_digit_unix_timestamp_for_specified_days('1').then(
        (closingDateTimestamp) => {
          cy.create_freeform_proposal(closingDateTimestamp);
        }
      );
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains(
        'party has insufficient tokens to submit proposal request in this epoch'
      ).should('be.visible');
      cy.get(dialogCloseButton).click();
    });

    Cypress.Commands.add(
      'convert_unix_timestamp_to_governance_data_table_date_format',
      (unixTimestamp) => {
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
          date = dateSupplied.getDate();

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
        freeformProposal.terms.closingTimestamp = timestamp;
        freeformProposal.rationale.title += timestamp;
        let proposalPayload = JSON.stringify(freeformProposal);

        cy.get(newProposalDatabox).type(proposalPayload, {
          parseSpecialCharSequences: false,
        });
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
        .its('body.data.networkParameters')
        .then(function (response) {
          let object = response.reduce(function (r, e) {
            r[e.key] = e.value;
            return r;
          }, {});

          return object;
        });
    });
  });
});
