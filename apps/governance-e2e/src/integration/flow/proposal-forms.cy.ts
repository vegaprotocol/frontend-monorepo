import {
  closeDialog,
  dissociateFromSecondWalletKey,
  navigateTo,
  navigation,
  turnTelemetryOff,
  waitForSpinner,
} from '../../support/common.functions';
import {
  getDownloadedProposalJsonPath,
  getProposalFromTitle,
  submitUniqueRawProposal,
} from '../../support/governance.functions';
import {
  getProposalInformationFromTable,
  goToMakeNewProposal,
  governanceProposalType,
  voteForProposal,
} from '../../support/governance.functions';
import {
  ensureSpecifiedUnstakedTokensAreAssociated,
  stakingPageAssociateTokens,
  stakingPageDisassociateAllTokens,
} from '../../support/staking.functions';
import { ethereumWalletConnect } from '../../support/wallet-eth.functions';
import {
  switchVegaWalletPubKey,
  vegaWalletFaucetAssetsWithoutCheck,
  vegaWalletSetSpecifiedApprovalAmount,
  vegaWalletTeardown,
} from '../../support/wallet-functions';

// For some reason in this the below imports are typed as the jest version, importing
// them directly is an easy work around.
import { before, beforeEach, it } from 'mocha';

const proposalListItem = '[data-testid="proposals-list-item"]';
const openProposals = 'open-proposals';
const proposalType = 'proposal-type';
const proposalDetails = 'proposal-details';
const newProposalSubmitButton = 'proposal-submit';
const proposalVoteDeadline = 'proposal-vote-deadline';
const proposalEnactmentDeadline = 'proposal-enactment-deadline';
const proposalParameterSelect = 'proposal-parameter-select';
const proposalMarketSelect = 'proposal-market-select';
const newProposalTitle = 'proposal-title';
const newProposalDescription = 'proposal-description';
const newProposalTerms = 'proposal-terms';
const newProposedParameterValue = 'selected-proposal-param-new-value';
const minVoteDeadline = 'min-vote';
const maxVoteDeadline = 'max-vote';
const minValidationDeadline = 'min-validation';
const minEnactDeadline = 'min-enactment';
const maxEnactDeadline = 'max-enactment';
const inputError = 'input-error-text';
const enactmentDeadlineError = 'enactment-before-voting-deadline';
const proposalDownloadBtn = 'proposal-download-json';
const feedbackError = '[data-testid="Error"]';
const viewProposalBtn = 'view-proposal-btn';
const proposalJsonToggle = 'proposal-json-toggle';
const proposalJsonSection = 'proposal-json';
const vegaWalletPublicKey = Cypress.env('vegaWalletPublicKey');
const fUSDCId =
  '816af99af60d684502a40824758f6b5377e6af48e50a9ee8ef478ecb879ea8bc';
const proposalTimeout = { timeout: 14000 };

// 3001-VOTE-007
context(
  'Governance flow - form validations for different governance proposals',
  { tags: '@slow' },
  function () {
    before('connect wallets and set approval limit', function () {
      cy.visit('/');
      vegaWalletSetSpecifiedApprovalAmount('1000');
    });

    beforeEach('visit governance tab', function () {
      cy.clearLocalStorage();
      turnTelemetryOff();
      cy.mockChainId();
      cy.reload();
      waitForSpinner();
      cy.connectVegaWallet();
      ethereumWalletConnect();
      cy.createMarket();
      ensureSpecifiedUnstakedTokensAreAssociated('1');
      navigateTo(navigation.proposals);
    });

    it('Unable to submit network parameter with missing/invalid fields', function () {
      navigateTo(navigation.proposals);
      goToMakeNewProposal(governanceProposalType.NETWORK_PARAMETER);
      cy.getByTestId(proposalDownloadBtn).click();
      cy.getByTestId(inputError).should('have.length', 3);
      cy.getByTestId(newProposalTitle).type(
        'Invalid update network parameter proposal'
      );
      cy.getByTestId(newProposalDescription).type(
        'E2E invalid test for proposals'
      );
      cy.getByTestId(proposalParameterSelect).select(
        'spam_protection_proposal_min_tokens'
      );
      cy.getByTestId(newProposedParameterValue).type('0');
      cy.getByTestId(proposalVoteDeadline).clear().type('0');
      cy.getByTestId(proposalDownloadBtn)
        .click()
        .then(() => {
          cy.wrap(
            getDownloadedProposalJsonPath('vega-network-param-proposal-')
          ).then((filePath) => {
            goToMakeNewProposal(governanceProposalType.RAW);
            submitUniqueRawProposal({ proposalBody: filePath, submit: false });
          });
        });
      cy.getByTestId(newProposalSubmitButton).click();
      validateDialogContentMsg('PROPOSAL_ERROR_CLOSE_TIME_TOO_SOON');
    });

    // 3007-PNEC-001 3007-PNEC-003
    it('Able to download and submit network param proposal', function () {
      goToMakeNewProposal(governanceProposalType.NETWORK_PARAMETER);
      // 3007-PNEC-006
      cy.getByTestId(newProposalTitle)
        .siblings()
        .should('contain.text', '(100 characters or less)');
      // 3007-PNEC-004 3007-PNEC-005
      cy.getByTestId(newProposalTitle).type(
        'Test update network parameter proposal'
      );
      // 3007-PNEC-009
      cy.getByTestId(newProposalDescription)
        .siblings()
        .should('contain.text', '(20,000 characters or less)');
      // 3007-PNEC-007 3007-PNEC-008
      cy.getByTestId(newProposalDescription).type(
        'E2E test for downloading proposals'
      );
      // 3007-PNEC-010
      cy.getByTestId(proposalParameterSelect).select(
        'governance_proposal_asset_minClose'
      );
      // 3007-PNEC-011
      cy.getByTestId(newProposedParameterValue).type('10s');
      // 3007-PNEC-012
      cy.getByTestId(proposalVoteDeadline).clear().type('2');
      // 3007-PNEC-013 3007-PNEC-014
      cy.getByTestId('voting-date').invoke('text').should('not.be.empty');
      // 3007-PNEC-015
      cy.getByTestId(maxEnactDeadline).click();
      // 3007-PNEC-016
      cy.getByTestId('enactment-date').invoke('text').should('not.be.empty');
      // 3007-PNEC-017
      cy.contains(
        'Time till enactment (must be equal to or after vote close)'
      ).should('be.visible');
      // 3007-PNE-018
      cy.log('Download updated proposal file');
      cy.getByTestId(proposalDownloadBtn)
        .should('be.visible')
        .click()
        .then(() => {
          cy.wrap(
            getDownloadedProposalJsonPath('vega-network-param-proposal-')
          ).then((filePath) => {
            cy.readFile(String(filePath), { timeout: 14000 }).then(
              (jsonFile) => {
                cy.wrap(jsonFile)
                  .its('rationale.description')
                  .should('eq', 'E2E test for downloading proposals');
                cy.wrap(jsonFile)
                  .its('terms.updateNetworkParameter.changes.key')
                  .should('eq', 'governance.proposal.asset.minClose');
                cy.wrap(jsonFile)
                  .its('terms.updateNetworkParameter.changes.value')
                  .should('eq', '10s');
              }
            );
            // 3007-PNE-019
            goToMakeNewProposal(governanceProposalType.RAW);
            submitUniqueRawProposal({ proposalBody: filePath });
          });
        });
    });

    it('Unable to submit network parameter proposal with vote deadline above enactment deadline', function () {
      navigateTo(navigation.proposals);
      goToMakeNewProposal(governanceProposalType.NETWORK_PARAMETER);
      cy.getByTestId(newProposalTitle).type(
        'Test update network parameter proposal'
      );
      cy.getByTestId(newProposalDescription).type('invalid deadlines');
      cy.getByTestId(proposalParameterSelect).select(
        'spam_protection_proposal_min_tokens'
      );
      cy.getByTestId(newProposedParameterValue).type('0');
      cy.getByTestId(proposalVoteDeadline).clear().type('0');
      cy.getByTestId(maxVoteDeadline).click();
      cy.getByTestId(enactmentDeadlineError).should(
        'have.text',
        'The proposal will fail if enactment is earlier than the voting deadline'
      );
      cy.getByTestId(proposalDownloadBtn)
        .should('be.visible')
        .click()
        .then(() => {
          cy.wrap(
            getDownloadedProposalJsonPath('vega-network-param-proposal-')
          ).then((filePath) => {
            goToMakeNewProposal(governanceProposalType.RAW);
            submitUniqueRawProposal({ proposalBody: filePath, submit: false });
          });
        });
      cy.getByTestId(newProposalSubmitButton).click();
      validateFeedBackMsg(
        'Invalid params: proposal_submission.terms.closing_timestamp (cannot be after enactment time)'
      );
    });

    // 3003-PMAN-001
    it(
      'Able to submit valid new market proposal',
      { tags: '@smoke' },
      function () {
        const proposalTitle = 'Test new market proposal';
        goToMakeNewProposal(governanceProposalType.NEW_MARKET);
        cy.getByTestId(newProposalTitle).type(proposalTitle);
        cy.getByTestId(newProposalDescription).type('E2E test for proposals');
        cy.fixture('/proposals/new-market').then((newMarketProposal) => {
          const newMarketPayload = JSON.stringify(newMarketProposal);
          cy.getByTestId(newProposalTerms).type(newMarketPayload, {
            parseSpecialCharSequences: false,
            delay: 2,
          });
          cy.getByTestId(proposalVoteDeadline).clear().type('2');
          cy.getByTestId(proposalEnactmentDeadline).clear().type('3');
        });
        cy.getByTestId(proposalDownloadBtn)
          .should('be.visible')
          .click()
          .then(() => {
            cy.wrap(
              getDownloadedProposalJsonPath('vega-new-market-proposal-')
            ).then((filePath) => {
              goToMakeNewProposal(governanceProposalType.RAW);
              submitUniqueRawProposal({ proposalBody: filePath }); // 3003-PMAN-003
            });
          });
        navigateTo(navigation.proposals);
        getProposalFromTitle(proposalTitle).within(() =>
          cy.getByTestId('view-proposal-btn').click()
        );
        cy.getByTestId('proposal-market-data').within(() => {
          cy.getByTestId('proposal-market-data-toggle').click();
          cy.contains('Key details').click();
          getMarketProposalDetailsFromTable('Name').should(
            'have.text',
            'Token test market'
          );
          cy.contains('Settlement asset').click();
          // Settlement asset symbol
          cy.getByTestId('3_value').should('have.text', 'fBTC');
          cy.contains('Oracle').click();
          cy.getByTestId('oracle-spec-links').should('have.attr', 'href');
        });
      }
    );

    it('Unable to submit new market proposal with missing/invalid fields', function () {
      const errorMsg =
        'Invalid params: the transaction does not use a valid Vega command: unknown field "invalid" in vega.NewMarket';

      goToMakeNewProposal(governanceProposalType.NEW_MARKET);
      cy.getByTestId(proposalDownloadBtn).should('be.visible').click();
      cy.getByTestId(inputError).should('have.length', 3);
      cy.getByTestId(newProposalTitle).type('Test new market proposal');
      cy.getByTestId(newProposalDescription).type('E2E test for proposals');
      cy.fixture('/proposals/new-market').then((newMarketProposal) => {
        newMarketProposal.invalid = 'I am an invalid field';
        const newMarketPayload = JSON.stringify(newMarketProposal);
        cy.getByTestId(newProposalTerms).type(newMarketPayload, {
          parseSpecialCharSequences: false,
          delay: 2,
        });
      });
      cy.getByTestId(proposalDownloadBtn)
        .should('be.visible')
        .click()
        .then(() => {
          cy.wrap(
            getDownloadedProposalJsonPath('vega-new-market-proposal-')
          ).then((filePath) => {
            goToMakeNewProposal(governanceProposalType.RAW);
            submitUniqueRawProposal({ proposalBody: filePath, submit: false });
          });
        });
      cy.getByTestId(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Transaction failed', proposalTimeout).should('be.visible');
      validateFeedBackMsg(errorMsg);
    });

    // Will fail if run after 'Able to submit update market proposal and vote for proposal'
    // 3002-PROP-022
    it.skip('Unable to submit update market proposal without equity-like share in the market', function () {
      switchVegaWalletPubKey();
      stakingPageAssociateTokens('1');
      goToMakeNewProposal(governanceProposalType.UPDATE_MARKET);
      cy.getByTestId(newProposalTitle).type(
        'Test update market proposal - rejected'
      );
      cy.getByTestId(newProposalDescription).type('E2E test for proposals');
      cy.getByTestId(proposalMarketSelect).select('Test market 1');
      cy.fixture('/proposals/update-market').then((updateMarketProposal) => {
        const newUpdateMarketProposal = JSON.stringify(updateMarketProposal);
        cy.getByTestId(newProposalTerms).type(newUpdateMarketProposal, {
          parseSpecialCharSequences: false,
          delay: 2,
        });
      });
      cy.getByTestId(proposalDownloadBtn)
        .should('be.visible')
        .click()
        .then(() => {
          cy.wrap(
            getDownloadedProposalJsonPath('vega-update-market-proposal-')
          ).then((filePath) => {
            goToMakeNewProposal(governanceProposalType.RAW);
            submitUniqueRawProposal({ proposalBody: filePath, submit: false });
          });
        });
      cy.getByTestId(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Proposal rejected', proposalTimeout).should('be.visible');
      validateDialogContentMsg('PROPOSAL_ERROR_INSUFFICIENT_EQUITY_LIKE_SHARE');
      closeDialog();
      ethereumWalletConnect();
      stakingPageDisassociateAllTokens();
      switchVegaWalletPubKey();
    });

    // 3002-PROP-020
    it('Unable to submit update market proposal without minimum amount of tokens', function () {
      vegaWalletTeardown();
      vegaWalletFaucetAssetsWithoutCheck(
        fUSDCId,
        '1000000',
        vegaWalletPublicKey
      );
      goToMakeNewProposal(governanceProposalType.UPDATE_MARKET);
      cy.getByTestId(newProposalTitle).type(
        'Test update market proposal - rejected'
      );
      cy.getByTestId(newProposalDescription).type('E2E test for proposals');
      cy.getByTestId(proposalMarketSelect).select('Test market 1');
      cy.fixture('/proposals/update-market').then((updateMarketProposal) => {
        const newUpdateMarketProposal = JSON.stringify(updateMarketProposal);
        cy.getByTestId(newProposalTerms).type(newUpdateMarketProposal, {
          parseSpecialCharSequences: false,
          delay: 2,
        });
      });
      cy.getByTestId(proposalDownloadBtn)
        .should('be.visible')
        .click()
        .then(() => {
          cy.wrap(
            getDownloadedProposalJsonPath('vega-update-market-proposal-')
          ).then((filePath) => {
            goToMakeNewProposal(governanceProposalType.RAW);
            submitUniqueRawProposal({ proposalBody: filePath, submit: false });
          });
        });
      cy.getByTestId(newProposalSubmitButton).should('be.visible').click();
      cy.contains('Transaction failed', proposalTimeout).should('be.visible');
      validateFeedBackMsg(
        'Network error: the network blocked the transaction through the spam protection: party has insufficient associated governance tokens in their staking account to submit proposal request (ABCI code 89)'
      );
    });

    // 3001-VOTE-092 3004-PMAC-001 3004-PMAC-003
    it('Able to submit update market proposal and vote for proposal', function () {
      vegaWalletFaucetAssetsWithoutCheck(
        fUSDCId,
        '1000000',
        vegaWalletPublicKey
      );
      goToMakeNewProposal(governanceProposalType.UPDATE_MARKET);
      cy.getByTestId(newProposalTitle).type('Test update market proposal');
      cy.getByTestId(newProposalDescription).type('E2E test for proposals');
      cy.getByTestId(proposalMarketSelect).select('Test market 1');
      cy.get('[data-testid="update-market-details"]').within(() => {
        cy.get('dd').eq(0).should('have.text', 'Test market 1');
        cy.get('dd').eq(1).should('have.text', 'TEST.24h');
        cy.get('dd').eq(2).should('not.be.empty');
        cy.get('dd')
          .eq(2)
          .invoke('text')
          .as('EnactedMarketId', { type: 'static' });
      });
      cy.get('@EnactedMarketId').then((marketId) => {
        cy.VegaWalletSubmitLiquidityProvision(String(marketId), '1');
      });
      cy.fixture('/proposals/update-market').then((updateMarketProposal) => {
        const newUpdateMarketProposal = JSON.stringify(updateMarketProposal);
        cy.getByTestId(newProposalTerms).type(newUpdateMarketProposal, {
          parseSpecialCharSequences: false,
          delay: 2,
        });
      });
      cy.getByTestId(proposalDownloadBtn)
        .should('be.visible')
        .click()
        .then(() => {
          cy.wrap(
            getDownloadedProposalJsonPath('vega-update-market-proposal-')
          ).then((filePath) => {
            goToMakeNewProposal(governanceProposalType.RAW);
            submitUniqueRawProposal({ proposalBody: filePath });
          });
        });
      navigateTo(navigation.proposals);
      cy.get('@EnactedMarketId').then((marketId) => {
        cy.contains(String(marketId).slice(0, 6))
          .parentsUntil(proposalListItem)
          .last()
          .within(() => {
            cy.getByTestId(viewProposalBtn).click();
          });
      });
      cy.getByTestId('lp-majority-not-met').should(
        'have.text',
        '66% majority threshold not met'
      );

      cy.getByTestId('token-majority-not-met').should(
        'have.text',
        '66% majority threshold not met'
      );
      voteForProposal('for');
      cy.getByTestId('lp-majority-met').should(
        'have.text',
        '66% majority threshold met'
      );
      cy.getByTestId('token-majority-met').should(
        'have.text',
        '66% majority threshold met'
      );
      cy.getByTestId('vote-status').should(
        'have.text',
        'Currently expected to  pass by token vote'
      );
    });

    // 3001-VOTE-026 3001-VOTE-027 3001-VOTE-028 3001-VOTE-095 3001-VOTE-096 3005-PASN-001
    it('Able to submit new asset proposal using min deadlines', function () {
      const proposalTitle = 'Test new asset proposal';
      goToMakeNewProposal(governanceProposalType.NEW_ASSET);
      cy.getByTestId(newProposalTitle).type(proposalTitle);
      cy.getByTestId(newProposalDescription).type('E2E test for proposals');
      cy.fixture('/proposals/new-asset').then((newAssetProposal) => {
        const newAssetPayload = JSON.stringify(newAssetProposal);
        cy.getByTestId(newProposalTerms).type(newAssetPayload, {
          parseSpecialCharSequences: false,
          delay: 2,
        });
      });
      cy.getByTestId(minVoteDeadline).click();
      cy.getByTestId(minValidationDeadline).click();
      cy.getByTestId(minEnactDeadline).click();
      cy.getByTestId(proposalDownloadBtn)
        .should('be.visible')
        .click()
        .then(() => {
          cy.wrap(
            getDownloadedProposalJsonPath('vega-new-asset-proposal-')
          ).then((filePath) => {
            goToMakeNewProposal(governanceProposalType.RAW);
            submitUniqueRawProposal({ proposalBody: filePath, submit: false }); // 3005-PASN-003
          });
        });
      cy.getByTestId(newProposalSubmitButton).should('be.visible').click();
      closeDialog();
      cy.getByTestId(newProposalSubmitButton).should('be.visible').click();
      // cannot submit a proposal with ERC20 address already in use
      cy.contains('Proposal rejected', proposalTimeout).should('be.visible');
      validateDialogContentMsg('PROPOSAL_ERROR_ERC20_ADDRESS_ALREADY_IN_USE');
      closeDialog();
      navigateTo(navigation.proposals);
      cy.contains(proposalTitle)
        .parentsUntil(proposalListItem)
        .last()
        .within(() => {
          cy.getByTestId(viewProposalBtn).click();
        });
      cy.getByTestId(proposalJsonToggle).click();
      cy.getByTestId(proposalJsonSection).within(() => {
        cy.contains('USDT Coin').should('be.visible');
        cy.contains('USDT').should('be.visible');
      });
    });

    it('Unable to submit new asset proposal with missing/invalid fields', function () {
      goToMakeNewProposal(governanceProposalType.NEW_ASSET);
      cy.getByTestId(proposalDownloadBtn).should('be.visible').click();
      cy.getByTestId(inputError).should('have.length', 3);
    });

    it('Able to submit update asset proposal using min deadline', function () {
      const assetId =
        'ebcd94151ae1f0d39a4bde3b21a9c7ae81a80ea4352fb075a92e07608d9c953d';

      goToMakeNewProposal(governanceProposalType.UPDATE_ASSET);
      enterUpdateAssetProposalDetails();
      cy.getByTestId(minVoteDeadline).click();
      cy.getByTestId(minEnactDeadline).click();
      cy.getByTestId(proposalDownloadBtn)
        .should('be.visible')
        .click()
        .then(() => {
          cy.wrap(
            getDownloadedProposalJsonPath('vega-update-asset-proposal-')
          ).then((filePath) => {
            goToMakeNewProposal(governanceProposalType.RAW);
            submitUniqueRawProposal({ proposalBody: filePath });
          });
        });
      navigateTo(navigation.proposals);
      cy.getByTestId(openProposals).within(() => {
        cy.getByTestId(proposalType)
          .contains('Update asset')
          .parentsUntil(proposalListItem)
          .last()
          .within(() => {
            cy.getByTestId(proposalDetails).should(
              'contain.text',
              assetId.slice(0, 6)
            ); // 3001-VOTE-029
            cy.getByTestId(viewProposalBtn).click();
          });
      });
      getProposalInformationFromTable('Proposed enactment') // 3001-VOTE-044
        .invoke('text')
        .should('not.be.empty');
      // 3001-VOTE-030 3001-VOTE-031
      cy.getByTestId(proposalJsonToggle).click();
      cy.getByTestId(proposalJsonSection).within(() => {
        cy.contains(assetId).should('be.visible');
        cy.contains('lifetimeLimit').should('be.visible');
        cy.contains('10').should('be.visible');
      });
    });

    // 3006-PASC-001 3006-PASC-003
    it('Able to submit update asset proposal using max deadline', function () {
      goToMakeNewProposal(governanceProposalType.UPDATE_ASSET);
      enterUpdateAssetProposalDetails();
      cy.getByTestId(maxVoteDeadline).click();
      cy.getByTestId(maxEnactDeadline).click();
      cy.getByTestId(proposalDownloadBtn)
        .should('be.visible')
        .click()
        .then(() => {
          cy.wrap(
            getDownloadedProposalJsonPath('vega-update-asset-proposal-')
          ).then((filePath) => {
            goToMakeNewProposal(governanceProposalType.RAW);
            submitUniqueRawProposal({ proposalBody: filePath });
          });
        });
    });

    it('Unable to submit edit asset proposal with missing/invalid fields', function () {
      goToMakeNewProposal(governanceProposalType.UPDATE_ASSET);
      cy.getByTestId(proposalDownloadBtn).should('be.visible').click();
      cy.getByTestId(inputError).should('have.length', 3);
    });

    it('Able to download and submit freeform proposal', function () {
      goToMakeNewProposal(governanceProposalType.FREEFORM);
      // 3008-PFRO-006
      cy.getByTestId(newProposalTitle)
        .siblings()
        .should('contain.text', '(100 characters or less)'); // 3008-PFRO-007
      // 3008-PFRO-005
      cy.getByTestId(newProposalTitle).type('Test freeform proposal form');
      // 3008-PFRO-009
      cy.getByTestId(newProposalDescription)
        .siblings()
        .should('contain.text', '(20,000 characters or less)'); // 3008-PFRO-010
      // 3008-PFRO-008 3002-PROP-012 3002-PROP-016
      cy.getByTestId(newProposalDescription).type(
        'E2E test for downloading freeform proposal'
      );
      // 3008-PFRO-012
      cy.getByTestId(minVoteDeadline).should('exist'); // 3002-PROP-008
      cy.getByTestId(maxVoteDeadline).should('exist');
      // 3008-PFRO-011
      cy.getByTestId(proposalVoteDeadline).clear().type('2');
      // 3008-PFRO-013 3008-PFRO-014
      cy.getByTestId('voting-date').invoke('text').should('not.be.empty');
      // 3008-PFRO-015
      cy.log('Download updated proposal file');
      cy.getByTestId(proposalDownloadBtn)
        .should('be.visible')
        .click()
        .then(() => {
          cy.wrap(
            getDownloadedProposalJsonPath('vega-freeform-proposal-')
          ).then((filePath) => {
            // 3008-PFRO-019
            goToMakeNewProposal(governanceProposalType.RAW);
            submitUniqueRawProposal({ proposalBody: filePath });
          });
        });
    });

    it('able to submit successor market proposal', function () {
      const proposalTitle = 'Test successor market proposal';

      cy.createMarket();
      cy.reload();
      waitForSpinner();
      cy.getByTestId('closed-proposals').within(() => {
        cy.contains('Add Lorem Ipsum market')
          .parentsUntil(proposalListItem)
          .last()
          .within(() => {
            cy.getByTestId(viewProposalBtn).click();
          });
      });
      getProposalInformationFromTable('ID').invoke('text').as('parentMarketId');
      goToMakeNewProposal(governanceProposalType.NEW_MARKET);
      cy.getByTestId(newProposalTitle).type(proposalTitle);
      cy.getByTestId(newProposalDescription).type(
        'E2E test for successor market'
      );
      cy.fixture('/proposals/successor-market').then((newMarketProposal) => {
        newMarketProposal.changes.successor.parentMarketId =
          this.parentMarketId;
        const newMarketPayload = JSON.stringify(newMarketProposal);
        cy.getByTestId(newProposalTerms).type(newMarketPayload, {
          parseSpecialCharSequences: false,
          delay: 2,
        });
        cy.getByTestId(proposalVoteDeadline).clear().type('2');
        cy.getByTestId(proposalEnactmentDeadline).clear().type('3');
      });
      cy.getByTestId(proposalDownloadBtn)
        .should('be.visible')
        .click()
        .then(() => {
          cy.wrap(
            getDownloadedProposalJsonPath('vega-new-market-proposal-')
          ).then((filePath) => {
            goToMakeNewProposal(governanceProposalType.RAW);
            submitUniqueRawProposal({ proposalBody: filePath });
          });
        });
      navigateTo(navigation.proposals);
      getProposalFromTitle(proposalTitle).within(() => {
        // 3003-PMAN-008
        cy.getByTestId('proposal-successor-info')
          .should('have.text', 'Successor market to: TEST.24h')
          .find('a')
          .should('have.attr', 'href')
          .and('contain', this.parentMarketId);
      });
    });

    after('Disassociate from second wallet key if present', function () {
      cy.reload();
      waitForSpinner();
      ethereumWalletConnect();
      dissociateFromSecondWalletKey();
    });

    function validateDialogContentMsg(expectedMsg: string) {
      cy.getByTestId('dialog-content')
        .last()
        .within(() => {
          cy.get('p').should('have.text', expectedMsg);
        });
    }

    function validateFeedBackMsg(expectedMsg: string) {
      cy.get(feedbackError).should('have.text', expectedMsg);
    }

    function enterUpdateAssetProposalDetails() {
      cy.getByTestId(newProposalTitle).type('Test update asset proposal');
      cy.getByTestId(newProposalDescription).type('E2E test for proposals');
      cy.fixture('/proposals/update-asset').then((newAssetProposal) => {
        const newAssetPayload = JSON.stringify(newAssetProposal);
        cy.getByTestId(newProposalTerms).type(newAssetPayload, {
          parseSpecialCharSequences: false,
          delay: 2,
        });
      });
    }

    function getMarketProposalDetailsFromTable(heading: string) {
      return cy
        .getByTestId('key-value-table-row')
        .contains(heading)
        .parent()
        .parent()
        .siblings();
    }
  }
);
