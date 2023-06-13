import { checkSorting } from '@vegaprotocol/cypress';
import * as Schema from '@vegaprotocol/types';

const liquidityTab = 'Liquidity';
const rowSelector =
  '[data-testid="tab-liquidity"] .ag-center-cols-container .ag-row';
const rowSelectorLiquidityActive =
  '[data-testid="tab-active"] .ag-center-cols-container .ag-row';
const rowSelectorLiquidityInactive =
  '[data-testid="tab-inactive"] .ag-center-cols-container .ag-row';
const marketSummaryBlock = 'header-summary';
const itemValue = 'item-value';
const itemHeader = 'item-header';

const headers = [
  'Party',
  'Commitment (tDAI)',
  'Share',
  'Proposed fee',
  'Market valuation at entry',
  'Obligation',
  'Supplied',
  'Status',
  'Created',
  'Updated',
];

describe('liquidity table - trading', { tags: '@smoke' }, () => {
  before(() => {
    cy.mockSubscription();
    cy.mockTradingPage(
      Schema.MarketState.STATE_ACTIVE,
      Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
      Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET
    );
    cy.visit('/');
    cy.wait('@LiquidityProvisions');
    cy.getByTestId(liquidityTab).click();
  });

  it('can see table headers', () => {
    // 5002-LIQP-001
    cy.getByTestId('tab-liquidity').within(($headers) => {
      cy.wrap($headers)
        .get('.ag-header-cell-text')
        .each(($header, i) => {
          cy.wrap($header).should('have.text', headers[i]);
        });
    });
  });

  it('renders liquidity table correctly', () => {
    // 5002-LIQP-002
    cy.get(rowSelector)
      .first()
      .find('[col-id="party.id"]')
      .should(
        'have.text',
        '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f'
      );

    cy.get(rowSelector)
      .first()
      .find('[col-id="commitmentAmount"]')
      .should('have.text', '4,000.00');

    cy.get(rowSelector)
      .first()
      .find('[col-id="equityLikeShare"]')
      .should('have.text', '100.00%');

    cy.get(rowSelector)
      .first()
      .find('[col-id="fee"]')
      .should('have.text', '0.09%');

    cy.get(rowSelector)
      .first()
      .find('[col-id="averageEntryValuation"]')
      .should('have.text', '685,852.93692');

    cy.get(rowSelector)
      .first()
      .find('[col-id="commitmentAmount_1"]')
      .should('have.text', '4,000.00');

    cy.get(rowSelector)
      .first()
      .find('[col-id="balance"]')
      .should('have.text', '4,000.00');

    cy.get(rowSelector)
      .first()
      .find('[col-id="status"]')
      .should('have.text', 'Active');

    cy.get(rowSelector)
      .first()
      .find('[col-id="createdAt"] button')
      .should('not.be.empty');
    cy.get(rowSelector)
      .first()
      .find('[col-id="updatedAt"] button')
      .should('not.be.empty');
  });
  // #4079
  it.skip('liquidity status column should be sorted properly', () => {
    // 5002-LIQP-003
    const liquidityColDefault = ['Active', 'Pending'];
    const liquidityColAsc = ['Active', 'Pending'];
    const liquidityColDesc = ['Pending', 'Active'];
    checkSorting(
      'status',
      liquidityColDefault,
      liquidityColAsc,
      liquidityColDesc
    );
  });
});

describe('liquidity table view - summary', { tags: '@smoke' }, () => {
  before(() => {
    cy.mockSubscription();
    cy.mockTradingPage(
      Schema.MarketState.STATE_ACTIVE,
      Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
      Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET
    );
    cy.visit('/#/liquidity/market-0');
    cy.wait('@LiquidityProvisions');
  });

  it('can see header title', () => {
    // 5002-LIQP-004
    // 5002-LIQP-005
    cy.getByTestId('header-title')
      .should('contain.text', 'BTCUSD.MF21 liquidity provision')
      .and('contain.text', 'Go to trading');
  });

  it('can see target stake', () => {
    // 5002-LIQP-006
    cy.getByTestId(marketSummaryBlock).within(() => {
      cy.getByTestId('target-stake').within(() => {
        cy.getByTestId(itemHeader).should('have.text', 'Target stake');
        cy.getByTestId(itemValue).should('have.text', '10.00 tDAI').realHover();
      });
    });
    cy.getByTestId('tooltip-content').should(
      'contain.text',
      `The market's liquidity requirement which is derived from the maximum open interest observed over a rolling time window.The market's liquidity requirement which is derived from the maximum open interest observed over a rolling time window.`
    );
  });

  it('can see supplied stake', () => {
    // 5002-LIQP-007
    cy.getByTestId(marketSummaryBlock).within(() => {
      cy.getByTestId('supplied-stake').within(() => {
        cy.getByTestId(itemHeader).should('have.text', 'Supplied stake');
        cy.getByTestId(itemValue).should('have.text', '0.01 tDAI').realHover();
      });
    });
    cy.getByTestId('tooltip-content').should(
      'contain.text',
      'The current amount of liquidity supplied for this market.'
    );
  });

  it('can see liquidity supplied', () => {
    //// 5002-LIQP-008
    cy.getByTestId(marketSummaryBlock).within(() => {
      cy.getByTestId('liquidity-supplied').within(() => {
        cy.getByTestId(itemHeader).should('have.text', 'Liquidity supplied');
        cy.getByTestId('indicator').should('be.visible');
        cy.getByTestId(itemValue).should('have.text', '0.10%').realHover();
      });
    });
  });

  it('can see market id', () => {
    // 5002-LIQP-009
    cy.getByTestId(marketSummaryBlock).within(() => {
      cy.getByTestId('liquidity-market-id').within(() => {
        cy.getByTestId(itemHeader).should('have.text', 'Market ID');
        cy.getByTestId(itemValue).should('have.text', 'market-0');
      });
    });
  });

  it('can see market id', () => {
    // 5002-LIQP-010
    cy.getByTestId(marketSummaryBlock).within(() => {
      cy.getByTestId('liquidity-learn-more').within(() => {
        cy.getByTestId(itemHeader).should('have.text', 'Learn more');
        cy.getByTestId(itemValue).should('have.text', 'Providing liquidity');
        cy.getByTestId('external-link')
          .should('have.attr', 'href')
          .and(
            'include',
            'https://docs.vega.xyz/testnet/concepts/liquidity/provision'
          );
      });
    });
  });
});

describe('liquidity table view', { tags: '@smoke' }, () => {
  before(() => {
    cy.mockSubscription();
    cy.mockTradingPage(
      Schema.MarketState.STATE_ACTIVE,
      Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
      Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET
    );
    cy.visit('/#/liquidity/market-0');
  });

  it('can see table headers', () => {
    cy.getByTestId('tab-active').within(($headers) => {
      cy.wrap($headers)
        .get('.ag-header-cell-text')
        .each(($header, i) => {
          cy.wrap($header).should('have.text', headers[i]);
        });
    });
  });

  it('renders liquidity active table correctly', () => {
    // 5002-LIQP-011
    cy.get(rowSelectorLiquidityActive)
      .first()
      .find('[col-id="party.id"]')
      .should(
        'have.text',
        '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f'
      );

    cy.get(rowSelectorLiquidityActive)
      .first()
      .find('[col-id="commitmentAmount"]')
      .should('have.text', '4,000.00');

    cy.get(rowSelectorLiquidityActive)
      .first()
      .find('[col-id="equityLikeShare"]')
      .should('have.text', '100.00%');

    cy.get(rowSelectorLiquidityActive)
      .first()
      .find('[col-id="fee"]')
      .should('have.text', '0.09%');

    cy.get(rowSelectorLiquidityActive)
      .first()
      .find('[col-id="averageEntryValuation"]')
      .should('have.text', '685,852.93692');

    cy.get(rowSelectorLiquidityActive)
      .first()
      .find('[col-id="commitmentAmount_1"]')
      .should('have.text', '4,000.00');

    cy.get(rowSelectorLiquidityActive)
      .first()
      .find('[col-id="balance"]')
      .should('have.text', '4,000.00');

    cy.get(rowSelectorLiquidityActive)
      .first()
      .find('[col-id="status"]')
      .should('have.text', 'Active');

    cy.get(rowSelectorLiquidityActive)
      .first()
      .find('[col-id="createdAt"] button')
      .should('not.be.empty');
    cy.get(rowSelectorLiquidityActive)
      .first()
      .find('[col-id="updatedAt"] button')
      .should('not.be.empty');
  });

  it('renders liquidity inactive table correctly', () => {
    //// 5002-LIQP-012
    cy.getByTestId('Inactive').click();
    cy.get(rowSelectorLiquidityInactive)
      .first()
      .find('[col-id="party.id"]')
      .should(
        'have.text',
        'cc464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f'
      );

    cy.get(rowSelectorLiquidityInactive)
      .first()
      .find('[col-id="commitmentAmount"]')
      .should('have.text', '4,000.00');

    cy.get(rowSelectorLiquidityInactive)
      .first()
      .find('[col-id="equityLikeShare"]')
      .should('have.text', '100.00%');

    cy.get(rowSelectorLiquidityInactive)
      .first()
      .find('[col-id="fee"]')
      .should('have.text', '0.40%');

    cy.get(rowSelectorLiquidityInactive)
      .first()
      .find('[col-id="averageEntryValuation"]')
      .should('have.text', '685,852.93692');

    cy.get(rowSelectorLiquidityInactive)
      .first()
      .find('[col-id="commitmentAmount_1"]')
      .should('have.text', '4,000.00');

    cy.get(rowSelectorLiquidityInactive)
      .first()
      .find('[col-id="balance"]')
      .should('have.text', '2,000.00');

    cy.get(rowSelectorLiquidityInactive)
      .first()
      .find('[col-id="status"]')
      .should('have.text', 'Pending');

    cy.get(rowSelectorLiquidityInactive)
      .first()
      .find('[col-id="createdAt"] button')
      .should('not.be.empty');
    cy.get(rowSelectorLiquidityInactive)
      .first()
      .find('[col-id="updatedAt"] button')
      .should('not.be.empty');
  });
});
