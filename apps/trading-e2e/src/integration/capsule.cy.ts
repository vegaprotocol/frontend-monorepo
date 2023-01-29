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
const btcSymbol = 'tBTC';
const usdcSymbol = 'fUSDC';
const toastContent = 'toast-content';
const ordersTab = 'Orders';
const depositsTab = 'Deposits';
const toastCloseBtn = 'toast-close';
const price = '390';
const size = '0.0005';
const newPrice = '200';

// TODO: ensure this test runs only if capsule is running via workflow
// Because the tests are run on a live network to optimize time, the tests are interdependent and must be run in the given order.
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
    cy.getByTestId('edit').should('contain.text', 'Edit');
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

  it('can edit order', function () {
    cy.getByTestId(ordersTab).click();
    cy.getByTestId('edit').first().should('be.visible').click();
    cy.getByTestId('dialog-title').should('contain.text', 'Edit order');
    cy.get('#limitPrice').focus().clear().type(newPrice);
    cy.getByTestId('edit-order').find('[type="submit"]').click();
    cy.getByTestId(toastContent).should(
      'contain.text',
      `ConfirmedYour transaction has been confirmed View in block explorerEdit order - activeTEST.24h+${size} @ ${newPrice}.00 ${usdcSymbol}+${size} @ ${newPrice}.00 ${usdcSymbol}`,
      { matchCase: false }
    );
    cy.getByTestId(ordersTab).click();
    cy.getByTestId(toastCloseBtn).click();
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

  it('can cancel order', function () {
    cy.getByTestId(ordersTab).click();
    cy.getByTestId('cancel').first().click();
    cy.getByTestId(toastContent).should(
      'contain.text',
      `ConfirmedYour transaction has been confirmed View in block explorerCancel order - cancelledTEST.24h+${size} @ ${newPrice}.00 ${usdcSymbol}`,
      { matchCase: false }
    );
    cy.getByTestId(toastCloseBtn).click();

    cy.getByTestId('tab-orders')
      .get('.ag-center-cols-container')
      .children()
      .first()
      .get(`[col-id='${orderStatus}']`, txTimeout)
      .should('contain.text', OrderStatusMapping.STATUS_CANCELLED);
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
    cy.getByTestId('deposit-approve-submit').click();
    cy.getByTestId('dialog-title').should('contain.text', 'Approve complete');
    cy.get('[data-testid="Return to deposit"]').click();
    cy.get(amountField).clear().type('1');
    cy.getByTestId('deposit-submit').click();
    cy.getByTestId(toastContent, txTimeout).should(
      'contain.text',
      `Transaction confirmedYour transaction has been confirmed.View on EtherscanDeposit 1.00 ${btcSymbol}`,
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
        cy.get('[col-id="amount"]').should('have.text', '1.00');
        cy.get('[col-id="createdTimestamp"]').should('not.be.empty');
        cy.get('[col-id="status"]').should('have.text', 'Finalized');
        cy.get('[col-id="txHash"]')
          .find('a')
          .should('have.attr', 'href')
          .and('contain', `${sepoliaUrl}/tx/0x`);
      });
  });

  it('can withdrawal', function () {
    // 1002-WITH-001
    // 1002-WITH-006
    // 1002-WITH-009
    // 1002-WITH-011
    // 1002-WITH-024
    // 1002-WITH-012
    // 1002-WITH-013
    // 1002-WITH-014
    // 1002-WITH-015
    // 1002-WITH-016
    // 1002-WITH-019

    cy.getByTestId('Withdrawals').click();
    cy.getByTestId('withdraw-dialog-button').click();
    cy.get(assetSelectField, txTimeout).select(
      'BTC (local)5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c - tBTC',
      { force: true }
    );
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

    cy.getByTestId('complete-withdrawal', txTimeout).should('not.exist');

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
  });

  it('deposit - if approved amount is less than deposit: must see that an approval is needed and be prompted to approve more', function () {
    // 1001-DEPO-006

    cy.getByTestId(depositsTab).click();
    cy.getByTestId('deposit-button').click();
    cy.get(assetSelectField, txTimeout).select(btcName, { force: true });
    cy.get(amountField).clear().type('20000000');
    cy.getByTestId('deposit-approve-submit').should('be.visible');
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
