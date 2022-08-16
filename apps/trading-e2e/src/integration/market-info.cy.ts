import { MarketState } from '@vegaprotocol/types';
import { mockTradingPage } from '../support/trading';

const marketInfoBtn = 'Info';
const row = 'key-value-table-row';
const marketTitle = 'accordion-title';

describe('market info is displayed', () => {
  before(() => {
    cy.mockGQL((req) => {
      mockTradingPage(req, MarketState.Active);
    });
    cy.visit('/markets/market-0');
    cy.wait('@Market');
    cy.getByTestId(marketInfoBtn).click();
  });

  it('current fees displayed', () => {
    cy.getByTestId(marketTitle).contains('Current fees').click();

    validateMarketDataRow(0, 'Maker Fee', '0.02%');
    validateMarketDataRow(1, 'Infrastructure Fee', '0.05%');
    validateMarketDataRow(2, 'Liquidity Fee', '1.00%');
  });

  it('market volume displayed', () => {
    cy.getByTestId(marketTitle).contains('Market volume').click();

    validateMarketDataRow(0, 'Indicative Volume', '0');
    validateMarketDataRow(1, 'Best Bid Volume', '5');
    validateMarketDataRow(2, 'Best Offer Volume', '1');
    validateMarketDataRow(3, 'Best Static Bid Volume', '5');
    validateMarketDataRow(4, 'Best Static Offer Volume', '1');
  });

  it('market price and interest displayed', () => {
    cy.getByTestId(marketTitle).contains('Market price and interest').click();

    validateMarketDataRow(0, 'Mark Price', '57.49');
    validateMarketDataRow(1, 'Open Interest', '0.00');
  });

  it('key details displayed', () => {
    cy.getByTestId(marketTitle).contains('Key details').click();

    validateMarketDataRow(0, 'Name', 'ETHBTC Quarterly (30 Jun 2022)');
    validateMarketDataRow(1, 'Decimal Places', '2');
    validateMarketDataRow(2, 'Position Decimal Places', '0');
    validateMarketDataRow(3, 'Trading Mode', 'Continuous');
    validateMarketDataRow(4, 'State', 'Active');
    validateMarketDataRow(5, 'Market ID', 'market-0');
  });

  it('instrument displayed', () => {
    cy.getByTestId(marketTitle).contains('Instrument').click();

    validateMarketDataRow(0, 'Market Name', 'BTCUSD Monthly (30 Jun 2022)');
    validateMarketDataRow(1, 'Code', 'BTCUSD.MF21');
    validateMarketDataRow(2, 'Product Type', 'Future');
    validateMarketDataRow(3, 'Quote Name', 'BTC');
  });

  it('settlement asset displayed', () => {
    cy.getByTestId(marketTitle).contains('Settlement asset').click();

    validateMarketDataRow(0, 'Name', 'tBTC TEST');
    validateMarketDataRow(1, 'Symbol', 'tBTC');
    validateMarketDataRow(
      2,
      'ID',
      '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c'
    );
  });

  it('metadata displayed', () => {
    cy.getByTestId(marketTitle).contains('Metadata').click();

    validateMarketDataRow(0, 'Formerly', '076BB86A5AA41E3E');
    validateMarketDataRow(1, 'Base', 'BTC');
    validateMarketDataRow(2, 'Quote', 'USD');
    validateMarketDataRow(3, 'Class', 'fx/crypto');
    validateMarketDataRow(4, 'Sector', 'crypto');
  });

  it('risk factors displayed', () => {
    cy.getByTestId(marketTitle).contains('Risk factors').click();

    validateMarketDataRow(0, 'Short', '0.008571790367285281');
    validateMarketDataRow(1, 'Long', '0.008508132993273576');
  });

  it('risk model displayed', () => {
    cy.getByTestId(marketTitle).contains('Risk model').click();

    validateMarketDataRow(0, 'Typename', 'LogNormalRiskModel');
    validateMarketDataRow(1, 'Tau', '0.0001140771161');
    validateMarketDataRow(2, 'Risk Aversion Parameter', '0.01');
  });

  it('price monitoring trigger displayed', () => {
    cy.getByTestId(marketTitle).contains('Price monitoring trigger 1').click();

    validateMarketDataRow(0, 'Horizon Secs', '43,200');
    validateMarketDataRow(1, 'Probability', '1');
    validateMarketDataRow(2, 'Auction Extension Secs', '600');
  });

  it('liquidity monitoring parameters displayed', () => {
    cy.getByTestId(marketTitle)
      .contains('Liquidity monitoring parameters')
      .click();

    validateMarketDataRow(0, 'Triggering Ratio', '0');
    validateMarketDataRow(1, 'Time Window', '3,600');
    validateMarketDataRow(2, 'Scaling Factor', '10');
  });

  afterEach('close toggle', () => {
    cy.get('[data-state="open"]').find('button').click();
  });

  function validateMarketDataRow(
    rowNumber: number,
    name: string,
    value: string
  ) {
    cy.getByTestId(row)
      .eq(rowNumber)
      .within(() => {
        cy.get('dt').should('contain.text', name);
        cy.get('dd').should('contain.text', value);
      });
  }
});
