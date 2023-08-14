import * as Schema from '@vegaprotocol/types';
import {
  TIFlist,
  orderPriceField,
  orderSizeField,
  orderTIFDropDown,
  placeOrderBtn,
  toggleLimit,
  toggleMarket,
} from '../support/deal-ticket';
import { aliasGQLQuery } from '@vegaprotocol/cypress';
import { accountsQuery } from '@vegaprotocol/mock';

describe('suspended market validation', { tags: '@regression' }, () => {
  before(() => {
    cy.setVegaWallet();
    cy.mockTradingPage(
      Schema.MarketState.STATE_SUSPENDED,
      Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
      Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET
    );
    const accounts = accountsQuery();
    cy.mockGQL((req) => {
      aliasGQLQuery(req, 'Accounts', accounts);
    });
    cy.mockSubscription();
    cy.visit('/#/markets/market-0');
    cy.wait('@Markets');
  });

  beforeEach(() => {
    cy.setVegaWallet();
  });

  it('should show warning for market order', function () {
    cy.getByTestId(toggleMarket).click();
    // 7002-SORD-060
    cy.getByTestId(placeOrderBtn).should('be.enabled');
    cy.getByTestId(placeOrderBtn).click();
    cy.getByTestId('deal-ticket-error-message-type').should(
      'have.text',
      'This market is in auction until it reaches sufficient liquidity. Only limit orders are permitted when market is in auction'
    );
  });

  it('should show info for allowed TIF', function () {
    cy.getByTestId(toggleLimit).click();
    cy.getByTestId(orderPriceField).clear().type('0.1');
    cy.getByTestId(orderSizeField).clear().type('1');
    cy.getByTestId(placeOrderBtn).should('be.enabled');
    cy.getByTestId(placeOrderBtn).click();
    cy.getByTestId('deal-ticket-warning-auction').should(
      'have.text',
      'Any orders placed now will not trade until the auction ends'
    );
  });

  it('should show warning for not allowed TIF', function () {
    cy.getByTestId(toggleLimit).click();
    cy.getByTestId(orderTIFDropDown).select(
      TIFlist.filter((item) => item.code === 'FOK')[0].value
    );
    cy.getByTestId(placeOrderBtn).should('be.enabled');
    cy.getByTestId(placeOrderBtn).click();
    cy.getByTestId('deal-ticket-error-message-tif').should(
      'have.text',
      'This market is in auction until it reaches sufficient liquidity. Until the auction ends, you can only place GFA, GTT, or GTC limit orders'
    );
  });
});
