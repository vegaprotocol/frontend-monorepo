const vegaWalletUnstakedBalance =
  '[data-testid="vega-wallet-balance-unstaked"]';
const vegaWalletStakedBalances =
  '[data-testid="vega-wallet-balance-staked-validators"]';
const vegaWalletAssociatedBalance = '[data-testid="currency-value"]';
const vegaWalletNameElement = '[data-testid="wallet-name"]';
const vegaWallet = '[data-testid="vega-wallet"]';
const vegaWalletName = Cypress.env('vegaWalletName');
const vegaWalletPassphrase = Cypress.env('vegaWalletPassphrase');
const connectToVegaWalletButton = '[data-testid="connect-to-vega-wallet-btn"]';
const newProposalSubmitButton = '[data-testid="proposal-submit"]';
const dialogCloseButton = '[data-testid="dialog-close"]';
const viewProposalButton = '[data-testid="view-proposal-btn"]';
const openProposals = '[data-testid="open-proposals"]';
const proposalResponseProposalIdPath =
  'response.body.data.busEvents.0.event.id';
const proposalVoteProgressForPercentage =
  '[data-testid="vote-progress-indicator-percentage-for"]';
const proposalVoteProgressAgainstPercentage =
  '[data-testid="vote-progress-indicator-percentage-against"]';
const proposalVoteProgressForTokens =
  '[data-testid="vote-progress-indicator-tokens-for"]';
const proposalVoteProgressAgainstTokens =
  '[data-testid="vote-progress-indicator-tokens-against"]';
const changeVoteButton = '[data-testid="change-vote-button"]';
const proposalDetailsTitle = '[data-testid="proposal-title"]';
const proposalDetailsDescription = '[data-testid="proposal-description"]';
const proposalVoteDeadline = '[data-testid="proposal-vote-deadline"]';
const voteButtons = '[data-testid="vote-buttons"]';
const voteStatus = '[data-testid="vote-status"]';
const rejectProposalsLink = '[href="/governance/rejected"]';
const feedbackError = '[data-testid="Error"]';
const inputError = '[data-testid="input-error-text"]'
const txTimeout = Cypress.env('txTimeout');
const epochTimeout = Cypress.env('epochTimeout');
const proposalTimeout = { timeout: 14000 };
const restConnectorForm = '[data-testid="rest-connector-form"]';
const newProposalTitle = '[data-testid="proposal-title"]';
const newProposalDescription = '[data-testid="proposal-description"]';
const proposalParameterSelect = '[data-testid="proposal-parameter-select"]';
const currentParameterValue = '[data-testid="selected-proposal-param-current-value"]'
const newProposedParameterValue = '[data-testid="selected-proposal-param-new-value"]'

const governanceProposalType = {
  NETWORK_PARAMETER: 'Network parameter',
  NEW_MARKET: 'New market',
  UPDATE_MARKET: 'Update market',
  NEW_ASSET: 'New asset',
  FREEFORM: 'Freeform',
};

context(
  'Governance flow - form validations for different governance proposals', { tags: '@slow' }, function() {
    before('connect wallets and set approval limit', function () {
      cy.vega_wallet_import();
      cy.visit('/');
      cy.verify_page_header('The $VEGA token');
      cy.get_network_parameters().then((network_parameters) => {
        cy.wrap(
          network_parameters['governance.proposal.freeform.minProposerBalance']
        ).as('minProposerBalance');
        cy.wrap(
          network_parameters['governance.proposal.freeform.minVoterBalance']
        ).as('minVoterBalance');
        cy.wrap(
          network_parameters['governance.proposal.freeform.requiredMajority'] *
            100
        ).as('requiredMajority');
        cy.wrap(
          network_parameters[
            'governance.proposal.freeform.requiredParticipation'
          ] * 100
        ).as('requiredParticipation');
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
        cy.wrap(
          network_parameters['governance.proposal.freeform.minClose'].split(
            'h'
          )[0]
        ).as('minCloseHours');
        cy.wrap(
          network_parameters['governance.proposal.freeform.maxClose'].split(
            'h'
          )[0]
        ).as('maxCloseHours');
      });
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
    });

    it('Able to submit valid update network parameter proposal', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );
      cy.navigate_to_page_if_not_already_loaded('governance');
        cy.go_to_make_new_proposal(governanceProposalType.NETWORK_PARAMETER);
        cy.get(newProposalTitle).type('Test update network parameter proposal');
        cy.get(newProposalDescription).type('E2E test for proposals')
        cy.get(proposalParameterSelect).select('governance_proposal_asset_minEnact')
        cy.get(currentParameterValue).should('have.value', '2s')
        cy.get(newProposedParameterValue).type('5s')
        cy.get(newProposalSubmitButton).should('be.visible').click();
        cy.wait_for_proposal_submitted();
    })

    it('Unable to submit network parameter with missing/invalid fields', function () {
      cy.ensure_specified_unstaked_tokens_are_associated(
        this.minProposerBalance
      );

      cy.navigate_to_page_if_not_already_loaded('governance');
        cy.go_to_make_new_proposal(governanceProposalType.NETWORK_PARAMETER);
        cy.get(newProposalSubmitButton).should('be.visible').click();
        cy.get(inputError).should('have.length', 3)
        cy.get(newProposalTitle).type('Invalid update network parameter proposal');
        cy.get(newProposalDescription).type('E2E invalid test for proposals')
        cy.get(proposalParameterSelect).select('spam_protection_proposal_min_tokens')
        cy.get(newProposedParameterValue).type('0')
        cy.get(proposalVoteDeadline).clear().type('0')
        cy.get(newProposalSubmitButton).click();
        cy.contains('Awaiting network confirmation', epochTimeout).should(
          'not.exist'
        );
        cy.get(proposalVoteDeadline).clear().type('9000')
        cy.get(newProposalSubmitButton).click();
        cy.contains('Awaiting network confirmation', epochTimeout).should(
          'not.exist'
        );
    })

    it('Able to submit valid new market proposal', function () {
      cy.go_to_make_new_proposal(governanceProposalType.NEW_MARKET);
      cy.get(newProposalTitle).type('Test new market proposal');
        cy.get(newProposalDescription).type('E2E test for proposals')
    })

});
