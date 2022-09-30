import { MarketState } from '@vegaprotocol/types';
import { mockTradingPage } from '../support/trading';
import { connectVegaWallet } from '../support/vega-wallet';
import { connectEthereumWallet } from '../support/ethereum-wallet';

beforeEach(() => {
  cy.mockGQL((req) => {
    mockTradingPage(req, MarketState.STATE_ACTIVE);
  });
  cy.mockWeb3Provider();
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

    connectEthereumWallet();
    
    cy.get(assetSymbolColumn).first().click();
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
