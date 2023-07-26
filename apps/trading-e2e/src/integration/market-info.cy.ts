import { MarketTradingModeMapping } from '@vegaprotocol/types';
import { MarketState } from '@vegaprotocol/types';
import compact from 'lodash/compact';

const accordionContent = 'accordion-content';
const blockExplorerLink = 'block-explorer-link';
const dialogClose = 'dialog-close';
const dialogContent = 'dialog-content';
const externalLink = 'external-link';
const githubLink = 'github-link';
const liquidityLink = 'view-liquidity-link';
const marketInfoBtn = 'Info';
const marketTitle = 'accordion-title';
const providerName = 'provider-name';
const row = 'key-value-table-row';
const verifiedProofs = 'verified-proofs';

describe('market info is displayed', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.mockTradingPage();
  });

  before(() => {
    cy.mockTradingPage(MarketState.STATE_ACTIVE);
    cy.mockSubscription();
    cy.visit('/#/markets/market-0');
    cy.wait('@Markets');
    cy.getByTestId(marketInfoBtn).click();
    cy.wait('@MarketInfo');
  });

  it('current fees displayed', () => {
    // 6002-MDET-101
    cy.getByTestId(marketTitle).contains('Current fees').click();
    validateMarketDataRow(0, 'Maker Fee', '0.02%');
    validateMarketDataRow(1, 'Infrastructure Fee', '0.05%');
    validateMarketDataRow(2, 'Liquidity Fee', '1.00%');
    validateMarketDataRow(3, 'Total Fees', '1.07%');
  });

  it('market price', () => {
    // 6002-MDET-102
    cy.getByTestId(marketTitle).contains('Market price').click();
    validateMarketDataRow(0, 'Mark Price', '46,126.90058');
    validateMarketDataRow(1, 'Best Bid Price', '44,126.90058 ');
    validateMarketDataRow(2, 'Best Offer Price', '48,126.90058 ');
    validateMarketDataRow(3, 'Quote Unit', 'BTC');
  });

  it('market volume displayed', () => {
    // 6002-MDET-103
    cy.getByTestId(marketTitle).contains('Market volume').click();
    validateMarketDataRow(1, 'Open Interest', '-');
    validateMarketDataRow(2, 'Best Bid Volume', '1');
    validateMarketDataRow(3, 'Best Offer Volume', '3');
    validateMarketDataRow(4, 'Best Static Bid Volume', '2');
    validateMarketDataRow(5, 'Best Static Offer Volume', '4');
  });

  it('insurance pool displayed', () => {
    // 6002-MDET-104
    cy.getByTestId(marketTitle).contains('Insurance pool').click();
    validateMarketDataRow(0, 'Balance', '0');
  });

  it('key details displayed', () => {
    // 6002-MDET-201
    cy.getByTestId(marketTitle).contains('Key details').click();

    const rows: [string, string][] = compact([
      ['Name', 'BTCUSD Monthly (30 Jun 2022)'],
      ['Market ID', 'market-0'],
      Cypress.env('NX_SUCCESSOR_MARKETS') && ['Parent Market ID', 'PARENT-A'],
      Cypress.env('NX_SUCCESSOR_MARKETS') && [
        'Insurance Pool Fraction',
        '0.75',
      ],
      ['Trading Mode', MarketTradingModeMapping.TRADING_MODE_CONTINUOUS],
      ['Market Decimal Places', '5'],
      ['Position Decimal Places', '0'],
      ['Settlement Asset Decimal Places', '5'],
    ]);

    for (const rowNumber in rows) {
      const [name, value] = rows[rowNumber];
      validateMarketDataRow(Number(rowNumber), name, value);
    }
  });

  it('instrument displayed', () => {
    // 6002-MDET-202
    cy.getByTestId(marketTitle).contains('Instrument').click();

    validateMarketDataRow(0, 'Market Name', 'BTCUSD Monthly (30 Jun 2022)');
    validateMarketDataRow(1, 'Code', 'BTCUSD.MF21');
    validateMarketDataRow(2, 'Product Type', 'Future');
    validateMarketDataRow(3, 'Quote Name', 'BTC');
  });

  it('oracle displayed', () => {
    // 6002-MDET-203
    cy.getByTestId(marketTitle).contains('Oracle').click();

    cy.getByTestId(accordionContent)
      .getByTestId(providerName)
      .and('contain', 'Another oracle');

    cy.getByTestId(providerName).should('be.visible').click();
    cy.getByTestId(dialogContent)
      .eq(1)
      .within(() => {
        cy.getByTestId(blockExplorerLink).contains('Block explorer');
        cy.getByTestId(githubLink).contains('Oracle repository');
      });
    cy.getByTestId(dialogClose).click();

    cy.getByTestId(accordionContent)
      .getByTestId(verifiedProofs)
      .and('contain', '1');
  });

  it('settlement asset displayed', () => {
    // 6002-MDET-206
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
    validateMarketDataRow(10, 'Infrastructure fee account balance', '0.00001');
    validateMarketDataRow(11, 'Global reward pool account balance', '0.00002');
  });

  it('metadata displayed', () => {
    // 6002-MDET-207
    cy.getByTestId(marketTitle).contains('Metadata').click();

    validateMarketDataRow(0, 'Formerly', '076BB86A5AA41E3E');
    validateMarketDataRow(1, 'Base', 'BTC');
    validateMarketDataRow(2, 'Quote', 'USD');
    validateMarketDataRow(3, 'Class', 'fx/crypto');
    validateMarketDataRow(4, 'Sector', 'crypto');
  });

  it('risk model displayed', () => {
    // 6002-MDET-208
    cy.getByTestId(marketTitle).contains('Risk model').click();
    validateMarketDataRow(0, 'Tau', '0.0001140771161');
    validateMarketDataRow(1, 'Risk Aversion Parameter', '0.01');
  });

  it('risk parameters displayed', () => {
    // 6002-MDET-209
    cy.getByTestId(marketTitle).contains('Risk parameters').click();
    validateMarketDataRow(0, 'R', '0.016');
    validateMarketDataRow(1, 'Sigma', '0.3');
  });

  it('risk factors displayed', () => {
    // 6002-MDET-210
    cy.getByTestId(marketTitle).contains('Risk factors').click();

    validateMarketDataRow(0, 'Short', '0.008571790367285281');
    validateMarketDataRow(1, 'Long', '0.008508132993273576');
  });

  it('price monitoring bounds displayed', () => {
    // 6002-MDET-211
    cy.getByTestId(marketTitle).contains('Price monitoring bounds 1').click();
    cy.get('p.col-span-1').contains('99.99999% probability price bounds');
    cy.get('p.col-span-1').contains('Within 43,200 seconds');
    validateMarketDataRow(0, 'Highest Price', '7.97323 ');
    validateMarketDataRow(1, 'Lowest Price', '6.54701 ');
  });

  it('liquidity monitoring parameters displayed', () => {
    // 6002-MDET-212
    cy.getByTestId(marketTitle)
      .contains('Liquidity monitoring parameters')
      .click();

    validateMarketDataRow(0, 'Triggering Ratio', '0.7');
    validateMarketDataRow(1, 'Time Window', '3,600');
    validateMarketDataRow(2, 'Scaling Factor', '10');
  });

  it('liquidity displayed', () => {
    // 6002-MDET-213
    cy.getByTestId(marketTitle)
      .contains(/Liquidity(?! m)/)
      .click();

    validateMarketDataRow(0, 'Target Stake', '10.00 tBTC');
    validateMarketDataRow(1, 'Supplied Stake', '0.01 tBTC');
    validateMarketDataRow(2, 'Market Value Proxy', '20.00 tBTC');
    cy.getByTestId(liquidityLink).should(
      'have.text',
      'View liquidity provision table'
    );
  });

  it('liquidity price range displayed', () => {
    // 6002-MDET-214
    cy.getByTestId(marketTitle).contains('Liquidity price range').click();

    validateMarketDataRow(0, 'Liquidity Price Range', '2.00% of mid price');
    validateMarketDataRow(1, 'Lowest Price', '45,204.362 BTC');
    validateMarketDataRow(2, 'Highest Price', '47,049.438 BTC');
  });

  it('proposal displayed', () => {
    // 6002-MDET-301
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
