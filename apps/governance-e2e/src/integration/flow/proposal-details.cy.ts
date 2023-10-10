import {
  navigateTo,
  waitForSpinner,
  navigation,
  turnTelemetryOff,
} from '../../support/common.functions';
import {
  createRawProposal,
  createTenDigitUnixTimeStampForSpecifiedDays,
  generateFreeFormProposalTitle,
  getDateFormatForSpecifiedDays,
  getProposalDetailsValue,
  getProposalFromTitle,
  getProposalInformationFromTable,
  goToMakeNewProposal,
  governanceProposalType,
  longProposalDescription,
  proposalChangeType,
  submitUniqueRawProposal,
  validateProposalDetailsDiff,
  voteForProposal,
} from '../../../../governance-e2e/src/support/governance.functions';
import {
  ensureSpecifiedUnstakedTokensAreAssociated,
  stakingPageAssociateTokens,
  stakingPageDisassociateAllTokens,
} from '../../../../governance-e2e/src/support/staking.functions';
import { ethereumWalletConnect } from '../../../../governance-e2e/src/support/wallet-eth.functions';
import {
  depositAsset,
  switchVegaWalletPubKey,
  vegaWalletSetSpecifiedApprovalAmount,
} from '../../support/wallet-functions';
import type { testFreeformProposal } from '../../support/common-interfaces';
import { formatDateWithLocalTimezone } from '@vegaprotocol/utils';
import {
  createGovernanceTransferProposalTxBody,
  createSuccessorMarketProposalTxBody,
} from '../../support/proposal.functions';

const proposalListItem = '[data-testid="proposals-list-item"]';
const participationNotMet = 'token-participation-not-met';
const voteStatus = 'vote-status';
const voteMajorityNotMet = 'token-majority-not-met';
const numberOfVotesFor = 'num-votes-for';
const votesForPercentage = 'votes-for-percentage';
const numberOfVotesAgainst = 'num-votes-against';
const votesAgainstPercentage = 'votes-against-percentage';
const totalVotedNumber = 'total-voted';
const totalVotedPercentage = 'total-voted-percentage';
const changeVoteButton = 'change-vote-button';
const proposalDetailsTitle = 'proposal-title';
const proposalDetailsDescription = 'proposal-description';
const openProposals = 'open-proposals';
const viewProposalButton = 'view-proposal-btn';
const proposalTermsToggle = 'proposal-json-toggle';
const marketDataToggle = 'proposal-market-data-toggle';
const governanceTransferToggle = 'proposal-transfer-details';
const marketProposalType = 'proposal-type';

describe(
  'Governance flow for proposal details',
  { tags: '@slow' },
  function () {
    before('connect wallets and set approval limit', function () {
      cy.visit('/');
      ethereumWalletConnect();
      cy.createMarket();
      navigateTo(navigation.proposals);
      cy.getByTestId('closed-proposals').within(() => {
        cy.contains('Add Lorem Ipsum market')
          .parentsUntil(proposalListItem)
          .last()
          .within(() => {
            cy.getByTestId(viewProposalButton).click();
          });
      });
      getProposalInformationFromTable('ID').invoke('text').as('parentMarketId');
    });

    beforeEach('visit proposals tab', function () {
      cy.clearLocalStorage();
      turnTelemetryOff();
      cy.mockChainId();
      cy.reload();
      waitForSpinner();
      ethereumWalletConnect();
      cy.connectVegaWallet();
      ensureSpecifiedUnstakedTokensAreAssociated('1');
      navigateTo(navigation.proposals);
    });

    // 3001-VOTE-050 3001-VOTE-054 3001-VOTE-055 3002-PROP-019
    it('Newly created raw proposal details - shows proposal title and full description', function () {
      const proposalDetails = longProposalDescription;

      goToMakeNewProposal(governanceProposalType.RAW);
      submitUniqueRawProposal({
        proposalTitle: 'raw proposal with long description',
        proposalDescription: proposalDetails,
      });
      cy.get<testFreeformProposal>('@rawProposal').then((rawProposal) => {
        cy.getByTestId(openProposals).within(() => {
          getProposalFromTitle(rawProposal.rationale.title).within(() => {
            cy.getByTestId(viewProposalButton).should('be.visible').click();
          });
        });
        cy.getByTestId(proposalDetailsTitle).should(
          'contain.text',
          rawProposal.rationale.title
        );
      });
      cy.getByTestId(proposalDetailsDescription).within(() => {
        cy.get('p').should('not.have.text', 'Hyperlink text');
        cy.getByTestId('show-more-btn').click();
        cy.get('p')
          .invoke('text')
          .should('have.have.length', 2194) // Full description is displayed
          .and('contain', 'Hyperlink text');
        cy.get('a').should('have.attr', 'href');
      });

      // 3001-VOTE-008
      getProposalInformationFromTable('ID')
        .invoke('text')
        .should('not.be.empty')
        .and('have.length', 64);
      // 3001-VOTE-009
      getProposalInformationFromTable('Proposed by')
        .invoke('text')
        .should('not.be.empty')
        .and('have.length', 64);
      cy.getByTestId(proposalTermsToggle).click();
      // 3001-VOTE-052 3001-VOTE-010
      cy.get('code.language-json')
        .should('exist')
        .within(() => {
          cy.get('.hljs-attr').eq(0).should('have.text', '"id"');
        });
    });

    // 3001-VOTE-043
    it('Newly created freeform proposal details - shows proposed and closing dates', function () {
      const proposalTitle = generateFreeFormProposalTitle();
      const proposalTimeStamp = createTenDigitUnixTimeStampForSpecifiedDays(3);

      submitUniqueRawProposal({
        proposalTitle: proposalTitle,
        closingTimestamp: proposalTimeStamp,
      });
      navigateTo(navigation.proposals);
      getProposalFromTitle(proposalTitle).within(() =>
        cy.getByTestId(viewProposalButton).click()
      );
      cy.wrap(
        formatDateWithLocalTimezone(new Date(proposalTimeStamp * 1000))
      ).then((closingDate) => {
        getProposalInformationFromTable('Closes on').should(
          'have.text',
          closingDate
        );
      });
      getProposalInformationFromTable('Proposed on')
        .invoke('text')
        .should('not.be.empty');
    });

    it('Newly created proposal details - shows default status set to fail', function () {
      // 3001-VOTE-037
      // 3001-VOTE-040
      // 3001-VOTE-067
      // 3001-VOTE-023
      createRawProposal();
      cy.get<testFreeformProposal>('@rawProposal').then((rawProposal) => {
        getProposalFromTitle(rawProposal.rationale.title).within(() =>
          cy.getByTestId(viewProposalButton).click()
        );
      });
      cy.getByTestId(participationNotMet).should(
        'have.text',
        '0.000000000000000000000015% participation threshold not met'
      );
      cy.getByTestId(voteMajorityNotMet).should(
        'have.text',
        '66% majority threshold not met'
      );
      cy.getByTestId(voteStatus).should(
        'have.text',
        'Currently expected to  fail'
      );
      // 3001-VOTE-062
      // 3001-VOTE-040
      // 3001-VOTE-070
      // 3001-VOTE-068
      cy.getByTestId(numberOfVotesFor).should('have.text', '0.0M');
      cy.getByTestId(numberOfVotesAgainst).should('have.text', '0.0M');
      cy.getByTestId(totalVotedNumber).should('have.text', '0.0M');
    });

    // 3001-VOTE-080 3001-VOTE-090 3001-VOTE-069 3001-VOTE-072 3001-VOTE-073
    it('Newly created proposal details - ability to vote for and against proposal - with minimum required tokens associated', function () {
      createRawProposal();
      cy.get<testFreeformProposal>('@rawProposal').then((rawProposal) => {
        getProposalFromTitle(rawProposal.rationale.title).within(() =>
          cy.getByTestId(viewProposalButton).click()
        );
      });
      // 3001-VOTE-080
      cy.getByTestId('vote-buttons').contains('against').should('be.visible');
      cy.getByTestId('vote-buttons').contains('for').should('be.visible');
      voteForProposal('for');
      getDateFormatForSpecifiedDays(0).then((votedDate) => {
        // 3001-VOTE-051
        // 3001-VOTE-093
        cy.contains('You voted:')
          .siblings()
          .contains('For')
          .siblings()
          .contains(votedDate)
          .should('be.visible');
      });
      cy.getByTestId(votesForPercentage) // 3001-VOTE-072
        .should('have.text', '100%');
      cy.getByTestId(votesAgainstPercentage).should('have.text', '0%');
      cy.getByTestId('token-majority-progress')
        .should('have.attr', 'style')
        .and('eq', 'width: 100%;'); // 3001-VOTE-024
      cy.getByTestId(changeVoteButton).should('be.visible').click();
      voteForProposal('for');
      // 3001-VOTE-064
      cy.getByTestId('user-voted-yes').should('exist');
      navigateTo(navigation.proposals);
      cy.get<testFreeformProposal>('@rawProposal').then((rawProposal) => {
        getProposalFromTitle(rawProposal.rationale.title).within(() => {
          // 3002-PROP-021
          cy.getByTestId('user-voted-yes').should('exist');
          cy.getByTestId(viewProposalButton).click();
        });
      });
      cy.getByTestId(changeVoteButton).should('be.visible').click();
      voteForProposal('against');
      cy.getByTestId(votesAgainstPercentage).should('have.text', '100%');
      navigateTo(navigation.proposals);
      cy.get<testFreeformProposal>('@rawProposal').then((rawProposal) => {
        getProposalFromTitle(rawProposal.rationale.title).within(() => {
          cy.getByTestId('user-voted-no').should('exist');
          cy.getByTestId(viewProposalButton).click();
        });
      });
    });

    // 3001-VOTE-042, 3001-VOTE-057, 3001-VOTE-058, 3001-VOTE-059, 3001-VOTE-060
    it('Newly created proposal details - ability to increase associated tokens - by voting again after association', function () {
      ensureSpecifiedUnstakedTokensAreAssociated('1');
      vegaWalletSetSpecifiedApprovalAmount('1000');
      createRawProposal();
      cy.get<testFreeformProposal>('@rawProposal').then((rawProposal) => {
        getProposalFromTitle(rawProposal.rationale.title).within(() =>
          cy.getByTestId(viewProposalButton).click()
        );
      });
      voteForProposal('for');
      // 3001-VOTE-079
      cy.contains('You voted: For').should('be.visible');
      cy.getByTestId(numberOfVotesFor).should('have.text', '0.0M');
      cy.getByTestId(votesForPercentage).should('have.text', '100%');
      cy.getByTestId(totalVotedNumber).should('have.text', '0.0M');
      cy.getByTestId(totalVotedPercentage).should('have.text', '(0.00%)');
      ethereumWalletConnect();
      stakingPageAssociateTokens('1000000', { approve: true });
      navigateTo(navigation.proposals);
      cy.get<testFreeformProposal>('@rawProposal').then((rawProposal) => {
        getProposalFromTitle(rawProposal.rationale.title).within(() =>
          cy.getByTestId(viewProposalButton).click()
        );
      });
      cy.getByTestId(votesForPercentage).should('have.text', '100%');
      cy.getByTestId(numberOfVotesFor).should('have.text', '0.0M');
      cy.getByTestId(totalVotedNumber).should('have.text', '0.0M');
      cy.getByTestId(totalVotedPercentage).should('have.text', '(0.00%)');
      // 3001-VOTE-065
      cy.getByTestId(changeVoteButton).should('be.visible').click();
      voteForProposal('for');
      cy.getByTestId(numberOfVotesFor).should('have.text', '1.0M');
      cy.getByTestId(totalVotedNumber).should('have.text', '1.0M');
      cy.getByTestId(totalVotedPercentage).should('have.text', '(1.54%)');
    });

    it('Able to vote for proposal twice by switching public key', function () {
      ensureSpecifiedUnstakedTokensAreAssociated('1');
      createRawProposal();
      cy.get<testFreeformProposal>('@rawProposal').then((rawProposal) => {
        getProposalFromTitle(rawProposal.rationale.title).within(() =>
          cy.getByTestId(viewProposalButton).click()
        );
        voteForProposal('for');
        cy.contains('You voted: For').should('be.visible');
        ethereumWalletConnect();
        switchVegaWalletPubKey();
        stakingPageAssociateTokens('2');
        navigateTo(navigation.proposals);
        getProposalFromTitle(rawProposal.rationale.title).within(() =>
          cy.getByTestId(viewProposalButton).click()
        );
        cy.getByTestId('you-voted').should('not.exist');
        voteForProposal('against');
        cy.contains('You voted: Against').should('be.visible');
        switchVegaWalletPubKey();
        // Checking vote status for different public keys is displayed correctly
        cy.contains('You voted: For').should('be.visible');
      });
      switchVegaWalletPubKey();
      stakingPageDisassociateAllTokens();
    });

    it('Able to see successor market details with new and updated values', function () {
      cy.getByTestId('closed-proposals').within(() => {
        cy.contains('Add Lorem Ipsum market')
          .parentsUntil(proposalListItem)
          .last()
          .within(() => {
            cy.getByTestId(viewProposalButton).click();
          });
      });
      cy.VegaWalletSubmitProposal(
        createSuccessorMarketProposalTxBody(this.parentMarketId)
      );
      navigateTo(navigation.proposals);
      cy.reload();
      getProposalFromTitle('Test successor market proposal details').within(
        () => cy.getByTestId(viewProposalButton).click()
      );
      // #3003-PMAN-010
      cy.getByTestId(proposalTermsToggle).click();
      cy.get('.language-json').within(() => {
        cy.get('.hljs-attr').should('contain.text', 'parentMarketId');
        cy.get('.hljs-string').should('contain.text', this.parentMarketId);
        cy.get('.hljs-attr').should('contain.text', 'insurancePoolFraction');
        cy.get('.hljs-string').should('contain.text', '0.75');
      });
      // 3003-PMAN-011 3003-PMAN-012
      cy.getByTestId(marketDataToggle).click();
      cy.getByTestId('proposal-market-data').within(() => {
        // Assert that all toggles are removed
        cy.getByTestId('accordion-toggle').should('not.exist');
        validateProposalDetailsDiff(
          'Name',
          proposalChangeType.UPDATED,
          'Token test market',
          'Test market 1'
        );
        validateProposalDetailsDiff(
          'Parent Market ID',
          proposalChangeType.ADDED,
          this.parentMarketId
        );
        validateProposalDetailsDiff(
          'Insurance Pool Fraction',
          proposalChangeType.ADDED,
          '0.75'
        );
        validateProposalDetailsDiff(
          'Trading Mode',
          proposalChangeType.UPDATED,
          'No trading',
          'Opening auction'
        );

        validateProposalDetailsDiff(
          'Market Name',
          proposalChangeType.UPDATED,
          'Token test market',
          'Test market 1'
        );

        validateProposalDetailsDiff(
          'Sector',
          proposalChangeType.UPDATED,
          'materials',
          'tech'
        );
      });

      // 3003-PMAN-011
      cy.contains('Parent Market ID').realHover();
      cy.getByTestId('tooltip-content', { timeout: 8000 }).should(
        'contain.text',
        'The ID of the market this market succeeds.'
      );
      cy.contains('Insurance Pool Fraction').realMouseUp().realHover();
      cy.getByTestId('tooltip-content', { timeout: 8000 }).should(
        'contain.text',
        'The fraction of the insurance pool balance that is carried over from the parent market to the successor.'
      );
    });

    it('Able to see perpetual market', function () {
      const proposalPath =
        'src/fixtures/proposals/new-market-perpetual-raw.json';
      const enactmentTimestamp = createTenDigitUnixTimeStampForSpecifiedDays(3);
      const closingTimestamp = createTenDigitUnixTimeStampForSpecifiedDays(2);
      submitUniqueRawProposal({
        proposalBody: proposalPath,
        enactmentTimestamp: enactmentTimestamp,
        closingTimestamp: closingTimestamp,
      });
      getProposalFromTitle('perpetual market proposal').within(() => {
        cy.getByTestId(marketProposalType).should(
          'have.text',
          'New market - perpetual'
        );
        cy.getByTestId(viewProposalButton).click();
      });
      cy.getByTestId(marketDataToggle).click();
      getProposalDetailsValue('Product Type').should(
        'contain.text',
        'Perpetual'
      );
      cy.getByTestId(marketProposalType).should(
        'have.text',
        'New market - perpetual'
      );
      // Liquidity SLA protocols
      getProposalDetailsValue('Performance Hysteresis Epochs').should(
        'contain.text',
        '1'
      );
      getProposalDetailsValue('SLA Competition Factor').should(
        'contain.text',
        '95.00%'
      );
      getProposalDetailsValue('Epoch Length').should('contain.text', '5s');
      getProposalDetailsValue('Non Performance Bond Penalty Max').should(
        'contain.text',
        '0.05'
      );
      getProposalDetailsValue('Stake To CCY Volume').should(
        'contain.text',
        '0.3'
      );
      getProposalDetailsValue('Min Probability Of Trading LP Orders').should(
        'contain.text',
        '1e-8'
      );
    });

    it('Able to see suspended market proposal', function () {
      const proposalPath = 'src/fixtures/proposals/suspend-market-raw.json';
      const enactmentTimestamp = createTenDigitUnixTimeStampForSpecifiedDays(3);
      const closingTimestamp = createTenDigitUnixTimeStampForSpecifiedDays(2);
      submitUniqueRawProposal({
        proposalBody: proposalPath,
        updateMarketId: this.parentMarketId,
        enactmentTimestamp: enactmentTimestamp,
        closingTimestamp: closingTimestamp,
      });
      getProposalFromTitle('Market suspended test').within(() => {
        cy.getByTestId(marketProposalType).should(
          'have.text',
          'Suspend market'
        );
        cy.getByTestId(viewProposalButton).click();
      });
      cy.getByTestId(marketProposalType).should('have.text', 'Suspend market');
      cy.getByTestId(marketDataToggle).click();
      cy.getByTestId('proposal-update-market-state').within(() => {
        getProposalInformationFromTable('Market ID')
          .invoke('text')
          .and('eq', this.parentMarketId);
      });
    });

    it('Able to see resume market proposal', function () {
      const proposalPath = 'src/fixtures/proposals/resume-market-raw.json';
      const enactmentTimestamp = createTenDigitUnixTimeStampForSpecifiedDays(3);
      const closingTimestamp = createTenDigitUnixTimeStampForSpecifiedDays(2);
      submitUniqueRawProposal({
        proposalBody: proposalPath,
        updateMarketId: this.parentMarketId,
        enactmentTimestamp: enactmentTimestamp,
        closingTimestamp: closingTimestamp,
      });
      getProposalFromTitle('Market resume test').within(() => {
        cy.getByTestId(marketProposalType).should('have.text', 'Resume market');
        cy.getByTestId(viewProposalButton).click();
      });
      cy.getByTestId(marketProposalType).should('have.text', 'Resume market');
      cy.getByTestId(marketDataToggle).click();
      cy.getByTestId('proposal-update-market-state').within(() => {
        getProposalInformationFromTable('Market ID')
          .invoke('text')
          .and('eq', this.parentMarketId);
      });
    });

    it('Able to see terminate market proposal', function () {
      const proposalPath = 'src/fixtures/proposals/terminate-market-raw.json';
      const enactmentTimestamp = createTenDigitUnixTimeStampForSpecifiedDays(3);
      const closingTimestamp = createTenDigitUnixTimeStampForSpecifiedDays(2);
      submitUniqueRawProposal({
        proposalBody: proposalPath,
        updateMarketId: this.parentMarketId,
        enactmentTimestamp: enactmentTimestamp,
        closingTimestamp: closingTimestamp,
      });
      getProposalFromTitle('Market terminate test').within(() => {
        cy.getByTestId(marketProposalType).should(
          'have.text',
          'Terminate market'
        );
        cy.getByTestId(viewProposalButton).click();
      });
      cy.getByTestId(marketProposalType).should(
        'have.text',
        'Terminate market'
      );
      cy.getByTestId(marketDataToggle).click();
      cy.getByTestId('proposal-update-market-state').within(() => {
        getProposalInformationFromTable('Market ID')
          .invoke('text')
          .and('eq', this.parentMarketId);
        getProposalDetailsValue('Termination Price').should(
          'contain.text',
          '0.001 fUSDC'
        );
      });
    });

    it('Able to see governance transfer proposal', function () {
      const vegaAssetAddress = '0x67175Da1D5e966e40D11c4B2519392B2058373de';
      depositAsset(vegaAssetAddress, '1000', 18);
      cy.getByTestId('currency-title', Cypress.env('txTimeout')).should(
        'contain.text',
        'Collateral'
      );
      cy.VegaWalletTopUpNetworkAccount('100');
      cy.VegaWalletSubmitProposal(createGovernanceTransferProposalTxBody());
      getProposalFromTitle('Governance transfer proposal').within(() => {
        cy.getByTestId(marketProposalType).should('have.text', 'NewTransfer');
        cy.getByTestId(viewProposalButton).click();
      });
      cy.getByTestId(marketProposalType).should('have.text', 'NewTransfer');
      cy.getByTestId(governanceTransferToggle).click();
      cy.getByTestId('proposal-transfer-details-table').within(() => {
        getProposalInformationFromTable('Source Type')
          .invoke('text')
          .and('eq', 'Network Treasury');
        getProposalInformationFromTable('Destination')
          .invoke('text')
          .and('eq', Cypress.env('vegaWalletPublicKey'));
        getProposalInformationFromTable('Asset')
          .invoke('text')
          .and('eq', 'VEGA');
        getProposalInformationFromTable('Fraction Of Balance')
          .invoke('text')
          .and('eq', '50%');
        getProposalInformationFromTable('Amount')
          .invoke('text')
          .and('eq', '100.00');
        getProposalInformationFromTable('Transfer Type')
          .invoke('text')
          .and('eq', 'All or nothing');
        getProposalInformationFromTable('Kind')
          .invoke('text')
          .and('eq', 'One off');
      });
    });

    it(' Able to see cancel transfer proposal - rejected', function () {
      const proposalPath = 'src/fixtures/proposals/cancel-transfer-raw.json';
      const enactmentTimestamp =
        createTenDigitUnixTimeStampForSpecifiedDays(11);
      const closingTimestamp = createTenDigitUnixTimeStampForSpecifiedDays(10);
      submitUniqueRawProposal({
        proposalBody: proposalPath,
        enactmentTimestamp: enactmentTimestamp,
        closingTimestamp: closingTimestamp,
        submit: false,
      });
      cy.getByTestId('icon-cross').click();
      navigateTo(navigation.proposals);
      cy.get('[href="/proposals/rejected"]').click();
      getProposalFromTitle('Governance cancel transfer proposal').within(() => {
        cy.getByTestId(marketProposalType).should(
          'have.text',
          'CancelTransfer'
        );
        cy.getByTestId(viewProposalButton).click();
      });
      cy.getByTestId(marketProposalType).should('have.text', 'CancelTransfer');
      getProposalInformationFromTable('Error details')
        .invoke('text')
        .and('eq', 'Governance transfer invalid transfer id not found');
      getProposalInformationFromTable('transferId')
        .invoke('text')
        .and('eq', 'invalid transfer id');
    });
  }
);
