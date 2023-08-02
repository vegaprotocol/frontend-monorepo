import * as Schema from '@vegaprotocol/types';

const expirtyTooltip = 'expiry-tooltip';
const externalLink = 'external-link';
const itemHeader = 'item-header';
const itemValue = 'item-value';
const link = 'link';
const liquidityLink = 'view-liquidity-link';
const liquiditySupplied = 'liquidity-supplied';
const liquiditySuppliedTooltip = 'liquidity-supplied-tooltip';
const marketChange = 'market-change';
const marketExpiry = 'market-expiry';
const marketMode = 'market-trading-mode';
const marketName = 'header-title';
const marketPrice = 'market-price';
const marketSettlement = 'market-settlement-asset';
const marketState = 'market-state';
const marketSummaryBlock = 'header-summary';
const marketVolume = 'market-volume';
const percentageValue = 'price-change-percentage';
const priceChangeValue = 'price-change';
const tradingModeTooltip = 'trading-mode-tooltip';

describe('Market trading page', () => {
  before(() => {
    cy.clearAllLocalStorage();
    cy.mockTradingPage(
      Schema.MarketState.STATE_ACTIVE,
      Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
      Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET
    );
    cy.mockSubscription();
    cy.setOnBoardingViewed();
    cy.visit('/#/markets/market-0');
    cy.wait('@MarketData');
    cy.getByTestId(marketSummaryBlock).should('be.visible');
  });

  describe('Market summary', { tags: '@smoke' }, () => {
    // 7002-SORD-001
    // 7002-SORD-002
    it('must display market name', () => {
      // 6002-MDET-001
      cy.getByTestId(marketName).should('not.be.empty');
    });

    it('must see market expiry', () => {
      // 6002-MDET-002
      cy.getByTestId(marketSummaryBlock).within(() => {
        cy.getByTestId(marketExpiry).within(() => {
          cy.getByTestId(itemHeader).should('have.text', 'Expiry');
          cy.getByTestId(itemValue).should('not.be.empty');
        });
      });
    });

    it('must see market price', () => {
      // 6002-MDET-003
      cy.getByTestId(marketSummaryBlock).within(() => {
        cy.getByTestId(marketPrice).within(() => {
          cy.getByTestId(itemHeader).should('have.text', 'Price');
          cy.getByTestId(itemValue).should('not.be.empty');
        });
      });
    });

    it('must see market change', () => {
      // 6002-MDET-004
      cy.getByTestId(marketSummaryBlock).within(() => {
        cy.getByTestId(marketChange).within(() => {
          cy.getByTestId(itemHeader).should('have.text', 'Change (24h)');
          cy.getByTestId(percentageValue).should('not.be.empty');
          cy.getByTestId(priceChangeValue).should('not.be.empty');
        });
      });
    });

    it('must see market volume', () => {
      // 6002-MDET-005
      cy.getByTestId(marketSummaryBlock).within(() => {
        cy.getByTestId(marketVolume).within(() => {
          cy.getByTestId(itemHeader).should('have.text', 'Volume (24h)');
          cy.getByTestId(itemValue).should('not.be.empty');
        });
      });
    });

    it('must see market mode', () => {
      // 6002-MDET-006
      cy.getByTestId(marketSummaryBlock).within(() => {
        cy.getByTestId(marketMode).within(() => {
          cy.getByTestId(itemHeader).should('have.text', 'Trading mode');
          cy.getByTestId(itemValue).should(
            'have.text',
            'Monitoring auction - liquidity (target not met)'
          );
        });
      });
    });

    it('must see market status', () => {
      // 6002-MDET-007
      // 7002-SORD-061
      cy.getByTestId(marketSummaryBlock).within(() => {
        cy.getByTestId(marketState).within(() => {
          cy.getByTestId(itemHeader).should('have.text', 'Status');
          cy.getByTestId(itemValue).should('not.be.empty');
        });
      });
    });

    it('must see market settlement', () => {
      // 6002-MDET-008
      cy.getByTestId(marketSummaryBlock).within(() => {
        cy.getByTestId(marketSettlement).within(() => {
          cy.getByTestId(itemHeader).should('have.text', 'Settlement asset');
          cy.getByTestId(itemValue).should('not.be.empty');
        });
      });
    });
    it('must see market liquidity supplied', () => {
      // 6002-MDET-009
      cy.getByTestId(marketSummaryBlock).within(() => {
        cy.getByTestId(liquiditySupplied).within(() => {
          cy.getByTestId(itemHeader).should('have.text', 'Liquidity supplied');
          cy.getByTestId(itemValue).should('not.be.empty');
        });
      });
    });
  });

  describe('Market tooltips', { tags: '@smoke' }, () => {
    it('should see expiry tooltip', () => {
      cy.getByTestId(marketSummaryBlock).within(() => {
        cy.getByTestId(marketExpiry).within(() => {
          cy.getByTestId(itemValue)
            .should('have.text', 'Not time-based')
            .realHover();
        });
      });
      cy.getByTestId(expirtyTooltip)
        .eq(0)
        .should(
          'contain.text',
          'This market expires when triggered by its oracle, not on a set date.'
        )
        .within(() => {
          cy.getByTestId(link)
            .should('have.attr', 'href')
            .and('include', Cypress.env('EXPLORER_URL'));
        });
    });

    it('should see trading conditions tooltip', () => {
      const toolTipLabel = 'tooltip-label';
      const toolTipValue = 'tooltip-value';
      const auctionToolTipLabels = [
        'Auction start',
        'Est. auction end',
        'Target liquidity',
        'Current liquidity',
        'Est. uncrossing price',
        'Est. uncrossing vol',
      ];

      cy.getByTestId(marketSummaryBlock).within(() => {
        cy.getByTestId(marketMode).within(() => {
          cy.getByTestId(itemValue)
            .should('contain.text', 'Monitoring auction')
            .and('contain.text', 'liquidity')
            .realHover();
        });
      });
      cy.getByTestId(tradingModeTooltip)
        .should(
          'contain.text',
          'This market is in auction until it reaches sufficient liquidity.'
        )
        .eq(0)
        .within(() => {
          cy.getByTestId(externalLink)
            .should('have.attr', 'href')
            .and('include', Cypress.env('TRADING_MODE_LINK'));

          for (let i = 0; i < 6; i++) {
            cy.getByTestId(toolTipLabel)
              .eq(i)
              .should('have.text', auctionToolTipLabels[i]);
            cy.getByTestId(toolTipValue).eq(i).should('not.be.empty');
          }
        });
    });

    it('should see liquidity supplied tooltip', () => {
      cy.getByTestId(marketSummaryBlock).within(() => {
        cy.getByTestId(liquiditySupplied).within(() => {
          cy.getByTestId(itemValue).realHover();
        });
      });
      cy.getByTestId(liquiditySuppliedTooltip)
        .should('contain.text', 'Supplied stake')
        .and('contain.text', 'Target stake')
        .first()
        .within(() => {
          cy.getByTestId(liquidityLink).should(
            'have.text',
            'View liquidity provision table'
          );
          cy.getByTestId(externalLink).should(
            'have.text',
            'Learn about providing liquidity'
          );
        });
    });
  });
});
