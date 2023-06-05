import {
  navigateTo,
  navigation,
  turnTelemetryOff,
  waitForSpinner,
} from '../../support/common.functions';
import {
  clickOnValidatorFromList,
  closeStakingDialog,
  stakingValidatorPageAddStake,
  waitForBeginningOfEpoch,
} from '../../support/staking.functions';
import { ethereumWalletConnect } from '../../support/wallet-eth.functions';
import {
  depositAsset,
  vegaWalletTeardown,
} from '../../support/wallet-teardown.functions';

const vegaAssetAddress = '0x67175Da1D5e966e40D11c4B2519392B2058373de';
const vegaWalletUnstakedBalance =
  '[data-testid="vega-wallet-balance-unstaked"]';
const rewardsTable = 'epoch-total-rewards-table';
const rewardsStartEpoch = 330; // Use 30 running locally
const rewardsEndEpoch = 500; // Change to 200 running locally
const txTimeout = Cypress.env('txTimeout');
const rewardsTimeOut = { timeout: 5 * 60 * 1000 };

context('rewards - flow', { tags: '@slow' }, function () {
  before('set up environment to allow rewards', function () {
    cy.clearLocalStorage();
    turnTelemetryOff();
    cy.visit('/');
    waitForSpinner();
    ethereumWalletConnect();
    cy.connectVegaWallet();
    depositAsset(vegaAssetAddress, '1000', 18);
    cy.getByTestId('currency-title').should('contain.text', 'Collateral');
    vegaWalletTeardown();
    cy.associateTokensToVegaWallet('6000');
    cy.VegaWalletTopUpRewardsPool(rewardsStartEpoch, rewardsEndEpoch);
    cy.get(vegaWalletUnstakedBalance, txTimeout).should(
      'contain',
      '6,000.0',
      txTimeout
    );
    navigateTo(navigation.validators);
    clickOnValidatorFromList(0);
    stakingValidatorPageAddStake('3000');
    closeStakingDialog();
    navigateTo(navigation.validators);
    clickOnValidatorFromList(1);
    stakingValidatorPageAddStake('3000');
    closeStakingDialog();
    navigateTo(navigation.rewards);
  });

  it('Should display rewards per epoch', function () {
    cy.getByTestId(rewardsTable, rewardsTimeOut).should('exist');
    cy.getByTestId(rewardsTable)
      .first()
      .within(() => {
        cy.getByTestId('asset', rewardsTimeOut).should('have.text', 'Vega');
        cy.getByTestId('ACCOUNT_TYPE_GLOBAL_REWARD').should('have.text', '1');
        cy.getByTestId('ACCOUNT_TYPE_FEES_INFRASTRUCTURE').should(
          'have.text',
          '0'
        );
        cy.getByTestId('total').should('have.text', '1');
      });
  });

  it('Should update when epoch starts', function () {
    cy.getByTestId(rewardsTable)
      .first()
      .within(() => {
        cy.get('h2').first().invoke('text').as('epochNumber');
      });
    waitForBeginningOfEpoch();
    cy.get('@epochNumber').then((epochNumber) => {
      cy.getByTestId(rewardsTable)
        .first()
        .within(() => {
          cy.get('h2').first().invoke('text').should('not.equal', epochNumber);
        });
    });
  });

  // 2002-SINC-009 2002-SINC-010 2002-SINC-011 2002-SINC-012
  it('Should display table of rewards earned by connected vega wallet', function () {
    cy.getByTestId('epoch-reward-view-toggle-individual').click();
    cy.getByTestId('connected-vega-key')
      .find('span')
      .should('have.text', Cypress.env('vegaWalletPublicKey'));
    cy.getByTestId('epoch-individual-rewards-table')
      .first()
      .within(() => {
        cy.get('h2').first().should('contain.text', 'EPOCH');
        cy.getByTestId('individual-rewards-asset').should('have.text', 'Vega');
        cy.getByTestId('ACCOUNT_TYPE_GLOBAL_REWARD', rewardsTimeOut)
          .should('contain.text', '0.4415')
          .and('contain.text', '(44.15%)');
        cy.getByTestId('ACCOUNT_TYPE_FEES_INFRASTRUCTURE')
          .should('contain.text', '0.0004')
          .and('contain.text', '(44.15%)');
        cy.getByTestId('total').should('have.text', '0.4419');
      });
  });
});
