import { aliasGQLQuery } from '@vegaprotocol/cypress';
import { proposalListQuery, marketUpdateProposal } from '@vegaprotocol/mock';
import * as Schema from '@vegaprotocol/types';

const marketSummaryBlock = 'header-summary';
const marketExpiry = 'market-expiry';
const marketPrice = 'market-price';
const marketChange = 'market-change';
const marketVolume = 'market-volume';
const marketMode = 'market-trading-mode';
const marketState = 'market-state';
const marketSettlement = 'market-settlement-asset';
const percentageValue = 'price-change-percentage';
const priceChangeValue = 'price-change';
const itemHeader = 'item-header';
const itemValue = 'item-value';

describe('Market proposal notification', { tags: '@smoke' }, () => {
  before(() => {
    cy.mockTradingPage(
      Schema.MarketState.STATE_ACTIVE,
      Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
      Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY
    );
    cy.mockGQL((req) => {
      aliasGQLQuery(
        req,
        'ProposalsList',
        proposalListQuery({
          proposalsConnection: {
            edges: [{ node: marketUpdateProposal }],
          },
        })
      );
    });
    cy.mockSubscription();
    cy.visit('/#/markets/market-0');
    cy.wait('@MarketData');
    cy.getByTestId(marketSummaryBlock).should('be.visible');
  });

  it('should display market proposal notification if proposal found', () => {
    cy.getByTestId(marketSummaryBlock).within(() => {
      cy.getByTestId('market-proposal-notification').should(
        'contain.text',
        'Changes have been proposed for this market'
      );
      cy.getByTestId('market-proposal-notification').within(() => {
        cy.getByTestId('external-link').should(
          'have.attr',
          'href',
          `${Cypress.env('VEGA_TOKEN_URL')}/proposals/123`
        );
      });
    });
  });
});

describe('Market trading page', () => {
  before(() => {
    cy.mockTradingPage(
      Schema.MarketState.STATE_ACTIVE,
      Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
      Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY
    );
    cy.mockSubscription();
    cy.visit('/#/markets/market-0');
    cy.wait('@MarketData');
    cy.getByTestId(marketSummaryBlock).should('be.visible');
  });

  describe('Market summary', { tags: '@smoke' }, () => {
    // 7002-SORD-001
    // 7002-SORD-002
    it('must display market name', () => {
      cy.getByTestId('popover-trigger').should('not.be.empty');
    });

    it('must see market expiry', () => {
      cy.getByTestId(marketSummaryBlock).within(() => {
        cy.getByTestId(marketExpiry).within(() => {
          cy.getByTestId(itemHeader).should('have.text', 'Expiry');
          cy.getByTestId(itemValue).should('not.be.empty');
        });
      });
    });

    it('must see market price', () => {
      cy.getByTestId(marketSummaryBlock).within(() => {
        cy.getByTestId(marketPrice).within(() => {
          cy.getByTestId(itemHeader).should('have.text', 'Price');
          cy.getByTestId(itemValue).should('not.be.empty');
        });
      });
    });

    it('must see market change', () => {
      cy.getByTestId(marketSummaryBlock).within(() => {
        cy.getByTestId(marketChange).within(() => {
          cy.getByTestId(itemHeader).should('have.text', 'Change (24h)');
          cy.getByTestId(percentageValue).should('not.be.empty');
          cy.getByTestId(priceChangeValue).should('not.be.empty');
        });
      });
    });

    it('must see market volume', () => {
      cy.getByTestId(marketSummaryBlock).within(() => {
        cy.getByTestId(marketVolume).within(() => {
          cy.getByTestId(itemHeader).should('have.text', 'Volume (24h)');
          cy.getByTestId(itemValue).should('not.be.empty');
        });
      });
    });

    it('must see market mode', () => {
      cy.getByTestId(marketSummaryBlock).within(() => {
        cy.getByTestId(marketMode).within(() => {
          cy.getByTestId(itemHeader).should('have.text', 'Trading mode');
          cy.getByTestId(itemValue).should('not.be.empty');
        });
      });
    });

    it('must see market state', () => {
      //7002-SORD-061
      cy.getByTestId(marketSummaryBlock).within(() => {
        cy.getByTestId(marketState).within(() => {
          cy.getByTestId(itemHeader).should('have.text', 'Status');
          cy.getByTestId(itemValue).should('not.be.empty');
        });
      });
    });

    it('must see market settlement', () => {
      cy.getByTestId(marketSummaryBlock).within(() => {
        cy.getByTestId(marketSettlement).within(() => {
          cy.getByTestId(itemHeader).should('have.text', 'Settlement asset');
          cy.getByTestId(itemValue).should('not.be.empty');
        });
      });
    });

    it('must see market mode', () => {
      cy.getByTestId(marketSummaryBlock).within(() => {
        cy.getByTestId(marketMode).within(() => {
          cy.getByTestId(itemHeader).should('have.text', 'Trading mode');
          cy.getByTestId(itemValue).should(
            'have.text',
            'Monitoring auction - liquidity'
          );
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
      cy.getByTestId('expiry-tooltip')
        .should(
          'contain.text',
          'This market expires when triggered by its oracle, not on a set date.'
        )
        .within(() => {
          cy.getByTestId('link')
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

      cy.getByTestId('trading-mode-tooltip')
        .should(
          'contain.text',
          'This market is in auction until it reaches sufficient liquidity.'
        )
        .within(() => {
          cy.getByTestId('external-link')
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
  });
});

describe('market states not accepting orders', { tags: '@smoke' }, function () {
  //7002-SORD-062
  //7002-SORD-063
  //7002-SORD-066

  const states = [
    Schema.MarketState.STATE_REJECTED,
    Schema.MarketState.STATE_CANCELLED,
    Schema.MarketState.STATE_CLOSED,
    Schema.MarketState.STATE_SETTLED,
    Schema.MarketState.STATE_TRADING_TERMINATED,
  ];

  states.forEach((marketState) => {
    describe(marketState, function () {
      beforeEach(function () {
        cy.mockTradingPage(marketState);
        cy.mockSubscription();
        cy.setVegaWallet();
        cy.visit('/#/markets/market-0');
        cy.wait('@Market');
      });
      it('must display that market is not accepting orders', function () {
        cy.getByTestId('place-order').click();
        cy.getByTestId('dealticket-error-message-summary').should(
          'have.text',
          `This market is ${marketState
            .split('_')
            .pop()
            ?.toLowerCase()} and not accepting orders`
        );
        cy.getByTestId('place-order').should('be.disabled');
      });
    });
  });
});
