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
const minVoteDeadline = '[data-testid="min-vote"]';
const maxVoteDeadline = '[data-testid="max-vote"]';
const minValidationDeadline = '[data-testid="min-validation"]';
const minEnactDeadline = '[data-testid="min-enactment"]';
const maxEnactDeadline = '[data-testid="max-enactment"]';
const dialogCloseButton = '[data-testid="dialog-close"]';
const inputError = '[data-testid="input-error-text"]';
const enactmentDeadlineError =
  '[data-testid="enactment-before-voting-deadline"]';
const proposalDownloadBtn = '[data-testid="proposal-download-json"]';
const feedbackError = '[data-testid="Error"]';
const epochTimeout = Cypress.env('epochTimeout');
const proposalTimeout = { timeout: 14000 };

const governanceProposalType = {
  NETWORK_PARAMETER: 'Network parameter',
  NEW_MARKET: 'New market',
  UPDATE_MARKET: 'Update market',
  NEW_ASSET: 'New asset',
  UPDATE_ASSET: 'Update asset',
  FREEFORM: 'Freeform',
  RAW: 'raw proposal',
};

// 3001-VOTE-007
context(
  'Governance flow - form validations for different governance proposals',
  { tags: '@slow' },
  function () {
    before('connect wallets and set approval limit', function () {
      cy.visit('/');
      cy.vega_wallet_set_specified_approval_amount('1000');
    });

    beforeEach('visit governance tab', function () {
      cy.reload();
      cy.wait_for_spinner();
      cy.connectVegaWallet();
      cy.ethereum_wallet_connect();
      cy.navigate_to('proposals');
    });

    it('Able to submit valid update network parameter proposal', function () {
      cy.ensure_specified_unstaked_tokens_are_associated('1');
      cy.go_to_make_new_proposal(governanceProposalType.NETWORK_PARAMETER);
      // 3002-PROP-006
      cy.get(newProposalTitle).type('Test update network parameter proposal');
      // 3002-PROP-007
      cy.get(newProposalDescription).type('E2E test for proposals');

      cy.get(proposalParameterSelect).find('option').should('have.length', 116);
      cy.get(proposalParameterSelect).select(
        // 3007-PNEC-002
        'governance_proposal_asset_minEnact'
      );
      cy.get(currentParameterValue).should('have.value', '2s');
      cy.get(newProposedParameterValue).type('5s'); // 3007-PNEC-003
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.wait_for_proposal_submitted();
    });

    it('Unable to submit network parameter with missing/invalid fields', function () {
      cy.navigate_to_page_if_not_already_loaded('proposals');
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

    it('Able to download network param proposal json', function () {
      const downloadFolder = './cypress/downloads/';
      cy.go_to_make_new_proposal(governanceProposalType.NETWORK_PARAMETER);
      cy.log('Download proposal file');
      cy.get(proposalDownloadBtn)
        .should('be.visible')
        .click()
        .then(() => {
          const filename =
            downloadFolder +
            'vega-network-param-proposal-' +
            getFormattedTime() +
            '.json';
          cy.readFile(filename, proposalTimeout)
            .its('terms.updateNetworkParameter')
            .should('exist');
        });

      cy.get(newProposalDescription).type('E2E test for downloading proposals');
      cy.get(proposalParameterSelect).select(
        'governance_proposal_asset_minClose'
      );
      cy.get(newProposedParameterValue).type('10s');

      cy.log('Download updated proposal file');
      cy.get(proposalDownloadBtn)
        .should('be.visible')
        .click()
        .then(() => {
          const filename =
            downloadFolder +
            'vega-network-param-proposal-' +
            getFormattedTime() +
            '.json';
          cy.get(proposalDownloadBtn).should('be.visible').click();
          cy.readFile(filename, proposalTimeout).then((jsonFile) => {
            cy.wrap(jsonFile)
              .its('rationale.description')
              .should('eq', 'E2E test for downloading proposals');
            cy.wrap(jsonFile)
              .its('terms.updateNetworkParameter.changes.key')
              .should('eq', 'governance.proposal.asset.minClose');
            cy.wrap(jsonFile)
              .its('terms.updateNetworkParameter.changes.value')
              .should('eq', '10s');
          });
        });
    });

    it('Unable to submit network parameter proposal with vote deadline above enactment deadline', function () {
      cy.navigate_to_page_if_not_already_loaded('proposals');
      cy.go_to_make_new_proposal(governanceProposalType.NETWORK_PARAMETER);
      cy.get(newProposalTitle).type('Test update network parameter proposal');
      cy.get(newProposalDescription).type('invalid deadlines');
      cy.get(proposalParameterSelect).select(
        'spam_protection_proposal_min_tokens'
      );
      cy.get(newProposedParameterValue).type('0');
      cy.get(proposalVoteDeadline).clear().type('0');
      cy.get(maxVoteDeadline).click();
      cy.get(enactmentDeadlineError).should(
        'have.text',
        'Proposal will fail if enactment is earlier than the voting deadline'
      );
      cy.get(newProposalSubmitButton).click();
      cy.get(feedbackError).should(
        'have.text',
        'Invalid params: proposal_submission.terms.closing_timestamp (cannot be after enactment time)'
      );
      cy.get(dialogCloseButton).click();
      cy.get(minVoteDeadline).click();
      cy.get(enactmentDeadlineError).should('not.exist');
    });

    // Skipping because unclear what the required json is yet for new market proposal, will update once docs have been updated
    // 3003-todo-PMAN-001
    it.skip('Able to submit valid new market proposal', function () {
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
      cy.contains('Transaction failed', proposalTimeout).should('be.visible');
      cy.get(feedbackError).should(
        'have.text',
        'Invalid params: the transaction is malformed'
      );
    });

    // skipped because no markets available to select in capsule
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

    // 3001-VOTE-026 3001-VOTE-027  3001-VOTE-028 3001-VOTE-095 3001-VOTE-096 3005-PASN-001
    it('Able to submit new asset proposal using min deadlines', function () {
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
      cy.get(minVoteDeadline).click();
      cy.get(minValidationDeadline).click();
      cy.get(minEnactDeadline).click();
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Awaiting network confirmation', epochTimeout).should(
        'be.visible'
      );
      cy.contains('Proposal waiting for node vote', proposalTimeout).should(
        'be.visible'
      );
      cy.get(dialogCloseButton).click();
      cy.get(newProposalSubmitButton).should('be.visible').click();
      // cannot submit a proposal with ERC20 address already in use
      cy.contains('Proposal rejected', proposalTimeout).should('be.visible');
      cy.getByTestId('dialog-content').within(() => {
        cy.get('p').should(
          'have.text',
          'PROPOSAL_ERROR_ERC20_ADDRESS_ALREADY_IN_USE'
        );
      });
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

    it('Able to submit update asset proposal using min deadline', function () {
      cy.go_to_make_new_proposal(governanceProposalType.UPDATE_ASSET);
      enterUpdateAssetProposalDetails();
      cy.get(minVoteDeadline).click();
      cy.get(minEnactDeadline).click();
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.wait_for_proposal_submitted();
    });

    it('Able to submit update asset proposal using max deadline', function () {
      cy.go_to_make_new_proposal(governanceProposalType.UPDATE_ASSET);
      enterUpdateAssetProposalDetails();
      cy.get(maxVoteDeadline).click();
      cy.get(maxEnactDeadline).click();
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.wait_for_proposal_submitted();
    });

    it('Unable to submit edit asset proposal with missing/invalid fields', function () {
      cy.go_to_make_new_proposal(governanceProposalType.UPDATE_ASSET);
      cy.get(newProposalSubmitButton).should('be.visible').click();
      cy.get(inputError).should('have.length', 3);
    });

    function getFormattedTime() {
      const now = new Date();
      const day = now.getDate().toString().padStart(2, '0');
      const month = now.toLocaleString('en-US', { month: 'short' });
      const year = now.getFullYear().toString();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');

      return `${day}-${month}-${year}-${hours}-${minutes}`;
    }

    function enterUpdateAssetProposalDetails() {
      cy.get(newProposalTitle).type('Test update asset proposal');
      cy.get(newProposalDescription).type('E2E test for proposals');
      cy.fixture('/proposals/update-asset').then((newAssetProposal) => {
        let newAssetPayload = JSON.stringify(newAssetProposal);
        cy.get(newProposalTerms).type(newAssetPayload, {
          parseSpecialCharSequences: false,
          delay: 2,
        });
      });
    }
  }
);
