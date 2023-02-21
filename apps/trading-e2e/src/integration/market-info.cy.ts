import { MarketTradingModeMapping } from '@vegaprotocol/types';

const marketInfoBtn = 'Info';
const row = 'key-value-table-row';
const marketTitle = 'accordion-title';
const externalLink = 'external-link';
const accordionContent = 'accordion-content';

describe('market info is displayed', { tags: '@smoke' }, () => {
  before(() => {
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.visit('/#/markets/market-0');
    cy.wait('@Markets');
    cy.getByTestId(marketInfoBtn).click();
    cy.wait('@MarketInfo');
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
    validateMarketDataRow(3, 'Quote Unit', 'USD');
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
    validateMarketDataRow(3, 'Market Decimal Places', '5');
    validateMarketDataRow(4, 'Position Decimal Places', '0');
    validateMarketDataRow(5, 'Settlement Asset Decimal Places', '5');
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
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns('DISABLED WINDOW PROMPT');
    });
    validateMarketDataRow(0, 'ID', 'asset-id');
    validateMarketDataRow(1, 'Type', 'ERC20');
    validateMarketDataRow(2, 'Name', 'Euro');
    validateMarketDataRow(3, 'Symbol', 'tEURO');
    validateMarketDataRow(4, 'Decimals', '5');
    validateMarketDataRow(5, 'Quantum', '1');
    validateMarketDataRow(6, 'Status', 'Enabled');
    validateMarketDataRow(
      7,
      'Contract address',
      '0x0158031158Bb4dF2AD02eAA31e8963E84EA978a4'
    );
    validateMarketDataRow(8, 'Withdrawal threshold', '0.0005');
    validateMarketDataRow(9, 'Lifetime limit', '1,230');
  });

  it('metadata displayed', () => {
    cy.getByTestId(marketTitle).contains('Metadata').click();

    validateMarketDataRow(0, 'Formerly', '076BB86A5AA41E3E');
    validateMarketDataRow(1, 'Base', 'BTC');
    validateMarketDataRow(2, 'Quote', 'USD');
    validateMarketDataRow(3, 'Class', 'fx/crypto');
    validateMarketDataRow(4, 'Sector', 'crypto');
  });

  it('risk model displayed', () => {
    cy.getByTestId(marketTitle).contains('Risk model').click();

    validateMarketDataRow(0, 'Typename', 'LogNormalRiskModel');
    validateMarketDataRow(1, 'Tau', '0.0001140771161');
    validateMarketDataRow(2, 'Risk Aversion Parameter', '0.01');
  });

  it('risk parameters displayed', () => {
    cy.getByTestId(marketTitle).contains('Risk parameters').click();

    validateMarketDataRow(0, 'Typename', 'LogNormalModelParams');
    validateMarketDataRow(1, 'R', '0.016');
    validateMarketDataRow(2, 'Sigma', '0.3');
  });

  it('risk factors displayed', () => {
    cy.getByTestId(marketTitle).contains('Risk factors').click();

    validateMarketDataRow(0, 'Short', '0.008571790367285281');
    validateMarketDataRow(1, 'Long', '0.008508132993273576');
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
    cy.getByTestId(marketTitle)
      .contains(/Liquidity(?! m)/)
      .click();

    validateMarketDataRow(0, 'Target Stake', '0.56789 tBTC');
    validateMarketDataRow(1, 'Supplied Stake', '0.56767 tBTC');
    validateMarketDataRow(2, 'Market Value Proxy', '6.77678 tBTC');

    cy.getByTestId('view-liquidity-link').should(
      'have.text',
      'View liquidity provision table'
    );
  });

  it('liquidity price range displayed', () => {
    cy.getByTestId(marketTitle).contains('Liquidity price range').click();

    validateMarketDataRow(0, 'Liquidity Price Range', '2.00%');
    validateMarketDataRow(1, 'LP Volume Min', '0.05634 tBTC');
    validateMarketDataRow(2, 'LP Volume Max', '0.05864 tBTC');
  });

  it('oracle displayed', () => {
    cy.getByTestId(marketTitle).contains('Oracle').click();

    validateMarketDataRow(0, 'Settlement Data Property', 'prices.BTC.value');
    validateMarketDataRow(
      1,
      'Trading Termination Property',
      'termination.BTC.value'
    );

    cy.getByTestId(accordionContent)
      .find(`[data-testid="${externalLink}"]`)
      .should('have.attr', 'href')
      .and('contain', '/oracles');
  });

  it('proposal displayed', () => {
    cy.getByTestId(marketTitle).contains('Proposal').click();

    cy.getByTestId(accordionContent)
      .find(`[data-testid="${externalLink}"]`)
      .first()
      .should('have.text', 'View governance proposal')
      .and('have.attr', 'href')
      .and('contain', '/proposals/market-0');
    cy.getByTestId(accordionContent)
      .find(`[data-testid="${externalLink}"]`)
      .eq(1)
      .should('have.text', 'Propose a change to market')
      .and('have.attr', 'href')
      .and('contain', '/proposals/propose/update-market');
  });

  afterEach('close toggle', () => {
    cy.get('[data-state="open"]').then((tab) => {
      if (tab) tab.find('button').trigger('click');
    });
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
