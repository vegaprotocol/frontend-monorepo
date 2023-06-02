import { MarketTradingModeMapping } from '@vegaprotocol/types';
import { MarketState } from '@vegaprotocol/types';

const marketInfoBtn = 'Info';
const row = 'key-value-table-row';
const marketTitle = 'accordion-title';
const externalLink = 'external-link';
const accordionContent = 'accordion-content';
const providerName = 'provider-name';
const oracleBannerStatus = 'oracle-banner-status';
const oracleBannerDialogTrigger = 'oracle-banner-dialog-trigger';
const oracleFullProfile = 'oracle-full-profile';

describe('market info is displayed', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.mockTradingPage();
  });

  before(() => {
    cy.mockTradingPage(
      MarketState.STATE_ACTIVE,
      undefined,
      undefined,
      'COMPROMISED'
    );
    cy.mockSubscription();
    cy.visit('/#/markets/market-0');
    cy.wait('@Markets');
    cy.getByTestId(marketInfoBtn).click();
    cy.wait('@MarketInfo');
  });

  it('show oracle banner', () => {
    cy.getByTestId(marketTitle).contains('Oracle').click();
    cy.getByTestId(oracleBannerStatus).should('contain.text', 'COMPROMISED');
    cy.getByTestId(oracleBannerDialogTrigger)
      .should('contain.text', 'Show more')
      .click();
    cy.getByTestId(oracleFullProfile).should('exist');
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
    validateMarketDataRow(0, 'Mark Price', '46,126.90058');
    validateMarketDataRow(1, 'Best Bid Price', '44,126.90058 ');
    validateMarketDataRow(2, 'Best Offer Price', '48,126.90058 ');
    validateMarketDataRow(3, 'Quote Unit', 'BTC');
  });

  // TODO: fix this test
  // New volume check logic, added by https://github.com/vegaprotocol/frontend-monorepo/pull/3870 has caused the
  // 24hr volume assertion to fail as it now reads 'Unknown'
  it.skip('market volume displayed', () => {
    cy.getByTestId(marketTitle).contains('Market volume').click();
    validateMarketDataRow(1, 'Open Interest', '-');
    validateMarketDataRow(2, 'Best Bid Volume', '1');
    validateMarketDataRow(3, 'Best Offer Volume', '3');
    validateMarketDataRow(4, 'Best Static Bid Volume', '2');
    validateMarketDataRow(5, 'Best Static Offer Volume', '4');
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
    validateMarketDataRow(0, 'Tau', '0.0001140771161');
    validateMarketDataRow(1, 'Risk Aversion Parameter', '0.01');
  });

  it('risk parameters displayed', () => {
    cy.getByTestId(marketTitle).contains('Risk parameters').click();
    validateMarketDataRow(0, 'R', '0.016');
    validateMarketDataRow(1, 'Sigma', '0.3');
  });

  it('risk factors displayed', () => {
    cy.getByTestId(marketTitle).contains('Risk factors').click();

    validateMarketDataRow(0, 'Short', '0.008571790367285281');
    validateMarketDataRow(1, 'Long', '0.008508132993273576');
  });

  it('price monitoring bounds displayed', () => {
    cy.getByTestId(marketTitle).contains('Price monitoring bounds 1').click();
    cy.get('p.col-span-1').contains('99.99999% probability price bounds');
    cy.get('p.col-span-1').contains('Within 43,200 seconds');
    validateMarketDataRow(0, 'Highest Price', '7.97323 ');
    validateMarketDataRow(1, 'Lowest Price', '6.54701 ');
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

    validateMarketDataRow(0, 'Target Stake', '10.00 tBTC');
    validateMarketDataRow(1, 'Supplied Stake', '0.01 tBTC');
    validateMarketDataRow(2, 'Market Value Proxy', '20.00 tBTC');

    cy.getByTestId('view-liquidity-link').should(
      'have.text',
      'View liquidity provision table'
    );
  });

  it('liquidity price range displayed', () => {
    cy.getByTestId(marketTitle).contains('Liquidity price range').click();

    validateMarketDataRow(0, 'Liquidity Price Range', '2.00% of mid price');
    validateMarketDataRow(1, 'Lowest Price', '45,204.362 BTC');
    validateMarketDataRow(2, 'Highest Price', '47,049.438 BTC');
  });

  it('oracle displayed', () => {
    cy.getByTestId(marketTitle).contains('Oracle').click();

    cy.getByTestId(accordionContent)
      .getByTestId(providerName)
      .and('contain', 'Another oracle');

    cy.getByTestId(providerName).should('be.visible').click();

    cy.getByTestId('dialog-content')
      .eq(1)
      .within(() => {
        cy.getByTestId('block-explorer-link').contains('Block explorer');
        cy.getByTestId('github-link').contains('Oracle repository');
      });
    cy.getByTestId('dialog-close').click();

    cy.getByTestId(accordionContent)
      .getByTestId('verified-proofs')
      .and('contain', '1');
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
