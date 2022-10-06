const newProposalSubmitButton = '[data-testid="proposal-submit"]';
const proposalVoteDeadline = '[data-testid="proposal-vote-deadline"]';
const proposalValidationDeadline =
  '[data-testid="proposal-validation-deadline"]';
const proposalParameterSelect = '[data-testid="proposal-parameter-select"]';
const proposalMarketSelect = '[data-testid="proposal-market-select"]';
const newProposalTitle = '[data-testid="proposal-title"]';
const newProposalDescription = '[data-testid="proposal-description"]';
const newProposalTerms = '[data-testid="proposal-terms"]';
const currentParameterValue =
  '[data-testid="selected-proposal-param-current-value"]';
const newProposedParameterValue =
  '[data-testid="selected-proposal-param-new-value"]';
const dialogCloseButton = '[data-testid="dialog-close"]';
const inputError = '[data-testid="input-error-text"]';
const epochTimeout = Cypress.env('epochTimeout');
const proposalTimeout = { timeout: 14000 };

const governanceProposalType = {
  NETWORK_PARAMETER: 'Network parameter',
  NEW_MARKET: 'New market',
  UPDATE_MARKET: 'Update market',
  NEW_ASSET: 'New asset',
  FREEFORM: 'Freeform',
};

context(
  'Governance flow - form validations for different governance proposals',
  { tags: '@slow' },
  function () {
    before('connect wallets and set approval limit', function () {
      cy.vega_wallet_import();
      cy.visit('/');
      cy.verify_page_header('The $VEGA token');
      cy.vega_wallet_connect();
      cy.vega_wallet_set_specified_approval_amount('1000');
      cy.reload();
      cy.wait_for_spinner();
      cy.verify_page_header('The $VEGA token');
      cy.ethereum_wallet_connect();
    });

    beforeEach('visit governance tab', function () {
      cy.navigate_to('governance');
      cy.wait_for_spinner();
      cy.intercept('POST', '/query', (req) => {
        if (req.body.operationName === 'ProposalEvent') {
          req.alias = 'proposalSubmissionCompletion';
        }
      });
      cy.ensure_specified_unstaked_tokens_are_associated('1');
    });

    it('Able to submit valid update network parameter proposal', function () {
      cy.navigate_to_page_if_not_already_loaded('governance');
      cy.go_to_make_new_proposal(governanceProposalType.NETWORK_PARAMETER);
      // 3002-PROP-006
      cy.get(newProposalTitle).type('Test update network parameter proposal');
      // 3002-PROP-007
      cy.get(newProposalDescription).type('E2E test for proposals');

      cy.get(proposalParameterSelect).find('option').should('have.length', 109);
      cy.get(proposalParameterSelect).select(
        'governance_proposal_asset_minEnact'
      );
      cy.get(currentParameterValue).should('have.value', '2s');
      cy.get(newProposedParameterValue).type('5s');
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.wait_for_proposal_submitted();
    });

    it('Unable to submit network parameter with missing/invalid fields', function () {
      cy.navigate_to_page_if_not_already_loaded('governance');
      cy.go_to_make_new_proposal(governanceProposalType.NETWORK_PARAMETER);
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.get(inputError).should('have.length', 3);
      cy.get(newProposalTitle).type(
        'Invalid update network parameter proposal'
      );
      cy.get(newProposalDescription).type('E2E invalid test for proposals');
      cy.get(proposalParameterSelect).select(
        'spam_protection_proposal_min_tokens'
      );
      cy.get(newProposedParameterValue).type('0');
      cy.get(proposalVoteDeadline).clear().type('0');
      cy.get(newProposalSubmitButton).click();
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'not.exist'
      );
      cy.get(proposalVoteDeadline).clear().type('9000');
      cy.get(newProposalSubmitButton).click();
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'not.exist'
      );
    });

    it('Able to submit valid new market proposal', function () {
      cy.go_to_make_new_proposal(governanceProposalType.NEW_MARKET);
      cy.get(newProposalTitle).type('Test new market proposal');
      cy.get(newProposalDescription).type('E2E test for proposals');
      cy.fixture('/proposals/new-market').then((newMarketProposal) => {
        let newMarketPayload = JSON.stringify(newMarketProposal);
        cy.get(newProposalTerms).type(newMarketPayload, {
          parseSpecialCharSequences: false,
          delay: 2,
        });
      });
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.wait_for_proposal_submitted();
    });

    it('Unable to submit new market proposal with missing/invalid fields', function () {
      cy.go_to_make_new_proposal(governanceProposalType.NEW_MARKET);
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.get(inputError).should('have.length', 3);
    });

    // skipped because of bug #1605
    it.skip('Able to submit update market proposal', function () {
      const marketId =
        '315a8e48db0a292c92b617264728048c82c20efc922c75fd292fc54e5c727c81';
      cy.go_to_make_new_proposal(governanceProposalType.UPDATE_MARKET);
      cy.get(newProposalTitle).type('Test update asset proposal');
      cy.get(newProposalDescription).type('E2E test for proposals');
      cy.get(proposalMarketSelect).select(marketId);
      cy.get('[data-testid="update-market-details"]').within(() => {
        cy.get('dd').eq(0).should('have.text', 'Oranges Daily');
        cy.get('dd').eq(1).should('have.text', 'ORANGES.24h');
        cy.get('dd').eq(2).should('have.text', marketId);
      });
      cy.fixture('/proposals/update-market').then((updateMarketProposal) => {
        let newUpdateMarketProposal = JSON.stringify(updateMarketProposal);
        cy.get(newProposalTerms).type(newUpdateMarketProposal, {
          parseSpecialCharSequences: false,
          delay: 2,
        });
      });
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.wait_for_proposal_submitted();
    });

    it('Able to submit new asset proposal', function () {
      cy.go_to_make_new_proposal(governanceProposalType.NEW_ASSET);
      cy.get(newProposalTitle).type('Test new asset proposal');
      cy.get(newProposalDescription).type('E2E test for proposals');
      cy.fixture('/proposals/new-asset').then((newAssetProposal) => {
        let newAssetPayload = JSON.stringify(newAssetProposal);
        cy.get(newProposalTerms).type(newAssetPayload, {
          parseSpecialCharSequences: false,
          delay: 2,
        });
      });
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Proposal waiting for node vote', proposalTimeout).should(
        'be.visible'
      );
      cy.get(dialogCloseButton).click();
    });

    it('Unable to submit new asset proposal with missing/invalid fields', function () {
      cy.go_to_make_new_proposal(governanceProposalType.NEW_ASSET);
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.get(inputError).should('have.length', 3);
      cy.get(newProposalTitle).type('Invalid new asset proposal');
      cy.get(newProposalDescription).type('Invalid E2E test for proposals');
      cy.get(proposalValidationDeadline).clear().type('2');
      cy.get(newProposalSubmitButton).click();
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'not.exist'
      );
    });
  }
);
