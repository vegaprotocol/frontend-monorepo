import { MarketState, MarketTradingModeMapping } from '@vegaprotocol/types';
import { mockTradingPage } from '../support/trading';

const marketInfoBtn = 'Info';
const row = 'key-value-table-row';
const marketTitle = 'accordion-title';
const link = 'link';
const externalLink = 'external-link';

describe('market info is displayed', { tags: '@smoke' }, () => {
  before(() => {
    cy.mockGQL((req) => {
      mockTradingPage(req, MarketState.STATE_ACTIVE);
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
    validateMarketDataRow(3, 'Total Fees', '1.07%');
  });

  it('market price', () => {
    cy.getByTestId(marketTitle).contains('Market price').click();
    validateMarketDataRow(0, 'Mark Price', '0.05749');
    validateMarketDataRow(1, 'Best Bid Price', '6.81765 ');
    validateMarketDataRow(2, 'Best Offer Price', '6.81769 ');
  });

  it('market volume displayed', () => {
    cy.getByTestId(marketTitle).contains('Market volume').click();
    validateMarketDataRow(0, '24 Hour Volume', '-');
    validateMarketDataRow(1, 'Open Interest', '0');
    validateMarketDataRow(2, 'Best Bid Volume', '5');
    validateMarketDataRow(3, 'Best Offer Volume', '1');
    validateMarketDataRow(4, 'Best Static Bid Volume', '5');
    validateMarketDataRow(5, 'Best Static Offer Volume', '1');
  });

  it('insurance pool displayed', () => {
    cy.getByTestId(marketTitle).contains('Insurance pool').click();
    validateMarketDataRow(0, 'Balance', '0');
  });

  it('key details displayed', () => {
    cy.getByTestId(marketTitle).contains('Key details').click();

    validateMarketDataRow(0, 'Name', 'BTCUSD Monthly (30 Jun 2022)');
    validateMarketDataRow(1, 'Market ID', 'market-0');
    validateMarketDataRow(
      2,
      'Trading Mode',
      MarketTradingModeMapping.TRADING_MODE_CONTINUOUS
    );
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
    validateMarketDataRow(2, 'Asset ID', 'market-0');
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

  it('price monitoring bound displayed', () => {
    cy.getByTestId(marketTitle).contains('Price monitoring bound 1').click();

    validateMarketDataRow(0, 'Min Valid Price', '6.54701 ');
    validateMarketDataRow(1, 'Max Valid Price', '7.97323 ');
    validateMarketDataRow(2, 'Reference Price', '7.22625 ');
  });

  it('liquidity monitoring parameters displayed', () => {
    cy.getByTestId(marketTitle)
      .contains('Liquidity monitoring parameters')
      .click();

    validateMarketDataRow(0, 'Triggering Ratio', '0');
    validateMarketDataRow(1, 'Time Window', '3,600');
    validateMarketDataRow(2, 'Scaling Factor', '10');
  });

  it('liquidity displayed', () => {
    cy.getByTestId('accordion-toggle').eq(13).click();

    validateMarketDataRow(0, 'Target Stake', '0.56789 tBTC');
    validateMarketDataRow(1, 'Supplied Stake', '0.56767 tBTC');
    validateMarketDataRow(2, 'Market Value Proxy', '6.77678 tBTC');

    cy.getByTestId(link).should('have.text', 'View liquidity provision table');
  });

  it('oracle displayed', () => {
    cy.getByTestId(marketTitle).contains('Oracle').click();

    validateMarketDataRow(0, 'Settlement Price Property', 'prices.BTC.value');
    validateMarketDataRow(
      1,
      'Trading Termination Property',
      'termination.BTC.value'
    );

    cy.getByTestId(externalLink)
      .should('have.attr', 'href')
      .and('contain', '/oracles');
  });

  it('proposal displayed', () => {
    cy.getByTestId(marketTitle).contains('Proposal').click();

    cy.getByTestId(externalLink)
      .should('have.text', 'View governance proposal')
      .and('have.attr', 'href')
      .and('contain', '/governance/market-0');
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
