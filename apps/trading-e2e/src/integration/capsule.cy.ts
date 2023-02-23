import { removeDecimal } from '@vegaprotocol/cypress';
import * as Schema from '@vegaprotocol/types';
import {
  OrderStatusMapping,
  OrderTimeInForceMapping,
  OrderTypeMapping,
  Side,
} from '@vegaprotocol/types';
import { isBefore, isAfter, addSeconds, subSeconds } from 'date-fns';
import { createOrder } from '../support/create-order';
import { connectEthereumWallet } from '../support/ethereum-wallet';

const orderSize = 'size';
const orderType = 'type';
const orderStatus = 'status';
const orderRemaining = 'remaining';
const orderPrice = 'price';
const orderTimeInForce = 'timeInForce';
const orderCreatedAt = 'createdAt';
const orderUpdatedAt = 'updatedAt';
const assetSelectField = 'select[name="asset"]';
const amountField = 'input[name="amount"]';
const txTimeout = Cypress.env('txTimeout');
const sepoliaUrl = Cypress.env('ETHERSCAN_URL');
const btcName =
  'BTC (local)5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c - tBTC';
const vegaName =
  'Vegab4f2726571fbe8e33b442dc92ed2d7f0d810e21835b7371a7915a365f07ccd9b - VEGA';
const btcSymbol = 'tBTC';
const vegaSymbol = 'VEGA';
const usdcSymbol = 'fUSDC';
const toastContent = 'toast-content';
const ordersTab = 'Orders';
const depositsTab = 'Deposits';
const collateralTab = 'Collateral';
const toastCloseBtn = 'toast-close';
const price = '390';
const size = '0.0005';
const newPrice = '200';
const completeWithdrawalBtn = 'complete-withdrawal';
const submitTransferBtn = '[type="submit"]';
const transferForm = 'transfer-form';

// Because the tests are run on a live network to optimize time, the tests are interdependent and must be run in the given order.
describe('capsule - without MultiSign', { tags: '@slow' }, () => {
  before(() => {
    cy.createMarket();
    cy.get('@markets').then((markets) => {
      cy.wrap(markets[0]).as('market');
    });
  });

  beforeEach(() => {
    cy.setVegaWallet();
  });

  it('can deposit', function () {
    cy.visit('/#/portfolio');
    cy.get('main[data-testid="/portfolio"]').should('exist');

    // 1001-DEPO-001
    // 1001-DEPO-002
    // 1001-DEPO-003
    // 1001-DEPO-005
    // 1001-DEPO-006
    // 1001-DEPO-007
    // 1001-DEPO-008
    // 1001-DEPO-009
    // 1001-DEPO-010

    cy.getByTestId(depositsTab).click();
    cy.getByTestId('deposit-button').click();
    connectEthereumWallet('Unknown');
    cy.get(assetSelectField, txTimeout).select(btcName, { force: true });
    cy.getByTestId('approve-warning').should(
      'contain.text',
      `Deposits of ${btcSymbol} not approved`
    );
    cy.getByTestId('deposit-submit').click();
    cy.getByTestId('dialog-title').should('contain.text', 'Approve complete');
    cy.get('[data-testid="Return to deposit"]').click();
    cy.get(amountField).clear().type('10');
    cy.getByTestId('deposit-submit').click();
    cy.getByTestId(toastContent, txTimeout).should(
      'contain.text',
      `Transaction confirmedYour transaction has been confirmed.View on EtherscanDeposit 10.00 ${btcSymbol}`,
      { matchCase: false }
    );
    cy.getByTestId(toastCloseBtn).click();
    cy.getByTestId('Collateral').click();

    cy.highlight('deposit verification');

    cy.getByTestId('asset', txTimeout).should('contain.text', btcSymbol);
    cy.getByTestId(depositsTab).click();
    cy.get('.ag-cell-value', txTimeout).should('contain.text', btcSymbol);
    cy.get('[col-id="status"]').should('not.have.text', 'Open', txTimeout);

    cy.get('[col-id="txHash"]')
      .should('have.length.above', 2)
      .eq(1)
      .parent()
      .within(() => {
        cy.get('[col-id="asset.symbol"]').should('have.text', btcSymbol);
        cy.get('[col-id="amount"]').should('have.text', '10.00');
        cy.get('[col-id="createdTimestamp"]').should('not.be.empty');
        cy.get('[col-id="status"]').should('have.text', 'Finalized');
        cy.get('[col-id="txHash"]')
          .find('a')
          .should('have.attr', 'href')
          .and('contain', `${sepoliaUrl}/tx/0x`);
      });
  });

  it('can key to key transfers', function () {
    cy.visit('/#/portfolio');
    cy.get('main[data-testid="/portfolio"]').should('exist');

    cy.getByTestId(collateralTab).click();
    cy.getByTestId('open-transfer-dialog').click();
    cy.getByTestId('transfer-form').should('be.visible');
    cy.getByTestId('transfer-form').find('[name="toAddress"]').select(1);
    cy.get('select option')
      .contains('BTC')
      .invoke('index')
      .then((index) => {
        cy.get(assetSelectField).select(index, { force: true });
      });
    cy.getByTestId(transferForm)
      .find(amountField)
      .focus()
      .type('1', { delay: 100 });
    cy.getByTestId(transferForm).find(submitTransferBtn).click();
    cy.getByTestId(toastContent).should(
      'contain.text',
      'Transfer completeYour transaction has been confirmed TransferTo 7f9cf0…c255351.00 tBTC'
    );
    cy.getByTestId(toastCloseBtn).click();
  });

  it('can not withdrawal because of no MultiSign', function () {
    // 1002-WITH-022
    // 1002-WITH-023

    cy.getByTestId('Withdrawals').click();
    cy.getByTestId('withdraw-dialog-button').click();
    connectEthereumWallet('Unknown');
    cy.get(assetSelectField, txTimeout).select(btcName, { force: true });
    cy.get(amountField).clear().type('1');
    cy.getByTestId('submit-withdrawal').click();
    cy.getByTestId(toastContent, txTimeout).should(
      'contain.text',
      'Funds unlocked'
    );
    cy.getByTestId(toastCloseBtn).click();
    cy.getByTestId('tab-withdrawals').within(() => {
      cy.get('.ag-center-cols-container')
        .children()
        .first()
        .within(() => {
          cy.get('[col-id="status"]').should('contain.text', 'Pending');
        });
    });

    cy.highlight('withdrawals verification');
    cy.getByTestId('toast-complete-withdrawal').click();

    cy.getByTestId(toastContent, txTimeout).should(
      'contain.text',
      'Error occurredprocessing response error'
    );
    cy.getByTestId(toastCloseBtn).click({ multiple: true });
    cy.getByTestId(completeWithdrawalBtn).should(
      'contain.text',
      'Complete withdrawal'
    );
  });
});

describe('capsule', { tags: '@slow' }, () => {
  before(() => {
    cy.createMarket();
    cy.get('@markets').then((markets) => {
      cy.wrap(markets[0]).as('market');
    });
    cy.updateCapsuleMultiSig();
  });

  beforeEach(() => {
    cy.setVegaWallet();
  });

  it('can place and receive an order', function () {
    const market = this.market;
    cy.visit(`/#/markets/${market.id}`);
    const order = {
      marketId: market.id,
      type: Schema.OrderType.TYPE_LIMIT,
      side: Schema.Side.SIDE_BUY,
      size: size,
      price: price,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
    };
    const rawPrice = removeDecimal(order.price, market.decimalPlaces);
    const rawSize = removeDecimal(order.size, market.positionDecimalPlaces);

    cy.getByTestId('Collateral').click();
    cy.getByTestId('asset', txTimeout).should('contain.text', usdcSymbol);

    createOrder(order);

    cy.getByTestId(toastContent).should(
      'contain.text',
      `ConfirmedYour transaction has been confirmed View in block explorerSubmit order - activeTEST.24h+${order.size} @ ${order.price}.00 ${usdcSymbol}`,
      { matchCase: false }
    );
    cy.getByTestId(toastCloseBtn).click();
    // orderbook cells are keyed by price level
    cy.getByTestId('tab-orderbook')
      .get(`[data-testid="price-${rawPrice}"]`)
      .should('contain.text', order.price)
      .get(`[data-testid="bid-vol-${rawPrice}"]`)
      .should('contain.text', rawSize);

    cy.getByTestId(ordersTab).click();
    cy.getByTestId('edit', txTimeout).should('contain.text', 'Edit');
    cy.getByTestId('tab-orders').within(() => {
      cy.get('.ag-center-cols-container')
        .children()
        .first()
        .within(() => {
          cy.get(`[col-id='${orderSize}']`).should(
            'contain.text',
            order.side === Side.SIDE_BUY ? '+' : '-' + order.size
          );

          cy.get(`[col-id='${orderType}']`).should(
            'contain.text',
            OrderTypeMapping[order.type]
          );

          cy.get(`[col-id='${orderStatus}']`).should(
            'contain.text',
            OrderStatusMapping.STATUS_ACTIVE
          );

          cy.get(`[col-id='${orderRemaining}']`).should(
            'contain.text',
            `0.00/${order.size}`
          );

          cy.get(`[col-id='${orderPrice}']`).then(($price) => {
            expect(parseFloat($price.text())).to.equal(parseFloat(order.price));
          });

          cy.get(`[col-id='${orderTimeInForce}']`).should(
            'contain.text',
            OrderTimeInForceMapping[order.timeInForce]
          );

          checkIfDataAndTimeOfCreationAndUpdateIsEqual(orderCreatedAt);
        });
    });
  });
  // comment because of bug #2695
  it.skip('can edit order', function () {
    cy.getByTestId(ordersTab).click();
    cy.getByTestId('edit').first().should('be.visible').click();
    cy.getByTestId('dialog-title').should('contain.text', 'Edit order');
    cy.get('#limitPrice').focus().clear().type(newPrice);
    cy.getByTestId('edit-order').find('[type="submit"]').click();

    cy.getByTestId(toastContent).should(
      'contain.text',
      `ConfirmedYour transaction has been confirmed View in block explorerEdit order - activeTEST.24h+${size} @ ${price}.00 ${usdcSymbol}+${size} @ ${newPrice}.00 ${usdcSymbol}`,
      { matchCase: false }
    );

    cy.getByTestId(toastCloseBtn).click({ multiple: true });
    cy.getByTestId(ordersTab).click();
    cy.get('.ag-center-cols-container')
      .children()
      .first()
      .within(() => {
        cy.get(`[col-id='${orderPrice}']`).then(($price) => {
          expect(parseFloat($price.text())).to.equal(parseFloat(newPrice));
        });
        checkIfDataAndTimeOfCreationAndUpdateIsEqual(orderUpdatedAt);
      });
  });
  // comment because of bug #2695
  it.skip('can cancel order', function () {
    cy.getByTestId(ordersTab).click();
    cy.getByTestId('cancel').first().click();
    cy.getByTestId(toastContent).should(
      'contain.text',
      `ConfirmedYour transaction has been confirmed View in block explorerCancel order - cancelledTEST.24h+${size} @ ${newPrice}.00 ${usdcSymbol}`,
      { matchCase: false }
    );
    cy.getByTestId(toastCloseBtn).click({ multiple: true });

    cy.getByTestId('tab-orders')
      .get('.ag-center-cols-container')
      .children()
      .first()
      .get(`[col-id='${orderStatus}']`, txTimeout)
      .should('contain.text', OrderStatusMapping.STATUS_CANCELLED);
  });

  it('can withdrawal', function () {
    // 1002-WITH-0014
    // 1002-WITH-006
    // 1002-WITH-009
    // 1002-WITH-011
    // 1002-WITH-024
    // 1002-WITH-012
    // 1002-WITH-013
    // 1002-WITH-014
    // 1002-WITH-015
    // 1002-WITH-016
    // 1002-WITH-017
    // 1002-WITH-019
    // 1002-WITH-020
    // 1002-WITH-021

    cy.visit('/#/portfolio');
    cy.get('main[data-testid="/portfolio"]').should('exist');

    cy.getByTestId('Withdrawals').click();
    cy.getByTestId('withdraw-dialog-button').click();
    connectEthereumWallet('Unknown');
    cy.get(assetSelectField, txTimeout).select(btcName, { force: true });
    cy.get(amountField).clear().type('1');
    cy.getByTestId('submit-withdrawal').click();
    cy.getByTestId(toastContent, txTimeout).should(
      'contain.text',
      'Funds unlocked'
    );
    cy.getByTestId('tab-withdrawals').within(() => {
      cy.get('.ag-center-cols-container')
        .children()
        .first()
        .within(() => {
          cy.get('[col-id="status"]').should('contain.text', 'Pending');
        });
    });

    cy.highlight('withdrawals verification');
    cy.getByTestId('toast-complete-withdrawal').click();

    cy.getByTestId(toastContent, txTimeout).should(
      'contain.text',
      'Transaction confirmed'
    );
    cy.getByTestId(toastCloseBtn).click({ multiple: true });

    cy.wrap(null).then(() => {
      try {
        cy.getByTestId(completeWithdrawalBtn)
          .eq(0, txTimeout)
          .should('not.exist');
      } catch (error) {
        console.log(
          'Assertion failed, but we are continuing because this is our wait to complete transaction'
        );
      }
    });

    cy.get('[col-id="txHash"]', txTimeout)
      .should('have.length.above', 1)
      .eq(1)
      .parent()
      .within(() => {
        cy.get('[col-id="asset.symbol"]').should('have.text', btcSymbol);
        cy.get('[col-id="amount"]').should('have.text', '1.00');
        cy.get('[col-id="details.receiverAddress"]')
          .find('a')
          .should('have.attr', 'href')
          .and('contain', `${sepoliaUrl}/address/`);
        cy.get('[col-id="createdTimestamp"]').should('not.be.empty');
        cy.get('[col-id="withdrawnTimestamp"]').should('not.be.empty');
        cy.get('[col-id="status"]').should('have.text', 'Completed');
        cy.get('[col-id="txHash"]')
          .find('a')
          .should('have.attr', 'href')
          .and('contain', `${sepoliaUrl}/tx/0x`);
      });
    // comment because of bug #2819
    // cy.getByTestId('withdraw-dialog-button').click();
    // cy.getByTestId('BALANCE_AVAILABLE_value').should('have.text', '0')
  });

  it('approved amount is less than deposit', function () {
    // 1001-DEPO-006

    cy.getByTestId(depositsTab).click();
    cy.getByTestId('deposit-button').click();
    cy.get(assetSelectField, txTimeout).select(btcName, { force: true });
    cy.get(amountField).clear().type('20000000');
    cy.getByTestId('deposit-approve-submit').should('be.visible');
  });

  it('withdraw - delay verification', function () {
    // 1001-DEPO-007
    // 1001-DEPO-024

    cy.visit('/#/portfolio');
    cy.get('main[data-testid="/portfolio"]').should('exist');

    cy.getByTestId(depositsTab).click();
    cy.getByTestId('deposit-button').click();
    connectEthereumWallet('Unknown');
    cy.get(assetSelectField, txTimeout).select(vegaName, { force: true });
    cy.getByTestId('deposit-submit').click();
    cy.getByTestId('dialog-title').should('contain.text', 'Approve complete');
    cy.get('[data-testid="Return to deposit"]').click();
    cy.get(amountField).clear().type('10000');
    cy.getByTestId('deposit-submit').click();
    cy.getByTestId(toastContent, txTimeout).should(
      'contain.text',
      `Your transaction has been confirmed.`,
      { matchCase: false }
    );
    cy.getByTestId(toastCloseBtn).click();
    cy.getByTestId('Collateral').click();

    cy.highlight('deposit verification');

    cy.getByTestId('asset', txTimeout).should('contain.text', vegaSymbol);
    cy.getByTestId(depositsTab).click();
    cy.get('.ag-cell-value', txTimeout).should('contain.text', vegaSymbol);
    cy.get('[col-id="status"]').should('not.have.text', 'Open', txTimeout);

    cy.get('[col-id="txHash"]')
      .should('have.length.above', 2)
      .eq(1)
      .parent()
      .within(() => {
        cy.get('[col-id="asset.symbol"]').should('have.text', vegaSymbol);
        cy.get('[col-id="amount"]').should('have.text', '10,000.00');
        cy.get('[col-id="createdTimestamp"]').should('not.be.empty');
        cy.get('[col-id="status"]').should('have.text', 'Finalized');
        cy.get('[col-id="txHash"]')
          .find('a')
          .should('have.attr', 'href')
          .and('contain', `${sepoliaUrl}/tx/0x`);
      });

    cy.getByTestId('Withdrawals').click();
    cy.getByTestId('withdraw-dialog-button').click();
    cy.get(assetSelectField, txTimeout).select(vegaName, { force: true });
    cy.get(amountField).clear().type('10000');
    cy.getByTestId('DELAY_TIME_value').should('have.text', '5 days');
    cy.getByTestId('submit-withdrawal').click();
    cy.getByTestId(toastContent, txTimeout).should(
      'contain.text',
      'Your funds have been unlocked'
    );
    cy.getByTestId(toastCloseBtn).click();
    cy.getByTestId(completeWithdrawalBtn).first().should('be.visible').click();
    cy.getByTestId(toastContent, txTimeout).should('contain.text', 'Delayed');
  });
});

function checkIfDataAndTimeOfCreationAndUpdateIsEqual(date: string) {
  cy.get(`[col-id='${date}'] .ag-cell-wrapper`)
    .children('span')
    .children('span')
    .invoke('data', 'value')
    .then(($dateTime) => {
      // allow a date 5 seconds either side to allow for
      // unexpected latency
      const minBefore = subSeconds(new Date(), 5);
      const maxAfter = addSeconds(new Date(), 5);
      console.log(maxAfter);
      const date = new Date($dateTime.toString());
      expect(isAfter(date, minBefore) && isBefore(date, maxAfter)).to.equal(
        true
      );
    });
}
