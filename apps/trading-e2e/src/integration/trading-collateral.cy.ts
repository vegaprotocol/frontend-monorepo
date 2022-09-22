import { MarketState } from '@vegaprotocol/types';
import { mockTradingPage } from '../support/trading';
import { connectVegaWallet } from '../support/vega-wallet';

beforeEach(() => {
  cy.mockGQL((req) => {
    mockTradingPage(req, MarketState.STATE_ACTIVE);
  });
  cy.mockGQLSubscription();
  cy.visit('/markets/market-0');
});

describe('collateral', { tags: '@smoke' }, () => {
  const collateralTab = 'Collateral';
  const assetSymbolColumn = "[col-id='asset.symbol']";
  const assetTypeColumn = "[col-id='type']";
  const assetMarketName =
    "[col-id='market.tradableInstrument.instrument.name']";
  it('renders collateral', () => {
    connectVegaWallet();
    cy.getByTestId(collateralTab).click();
    cy.get(assetSymbolColumn).each(($symbol) => {
      cy.wrap($symbol).invoke('text').should('not.be.empty');
    });
    cy.get(assetTypeColumn).should('contain.text', 'General');
    cy.get(assetMarketName).should(
      'contain.text',
      'AAVEDAI Monthly (30 Jun 2022)'
    );
    cy.getByTestId('price').each(($price) => {
      cy.wrap($price).invoke('text').should('not.be.empty');
    });
  });
});
