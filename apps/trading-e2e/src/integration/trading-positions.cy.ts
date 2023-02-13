import { checkSorting } from '@vegaprotocol/cypress';
import { aliasGQLQuery } from '@vegaprotocol/cypress';
import { marketsDataQuery } from '@vegaprotocol/mock';

beforeEach(() => {
  cy.mockTradingPage();
  cy.mockSubscription();
  cy.setVegaWallet();
});

describe('positions', { tags: '@smoke' }, () => {
  it('renders positions on trading page', () => {
    cy.visit('/#/markets/market-0');
    cy.getByTestId('Positions').click();
    validatePositionsDisplayed();
  });

  it('renders positions on portfolio page', () => {
    cy.visit('/#/portfolio');
    cy.getByTestId('Positions').click();
    validatePositionsDisplayed();
  });

  it('renders position among some graphql errors', () => {
    const errors = [
      {
        message: 'no market data for market: market-2',
        path: ['market', 'data'],
        extensions: {
          code: 13,
          type: 'Internal',
        },
      },
    ];
    const marketData = marketsDataQuery();
    const edges = marketData.marketsConnection?.edges.map((market) => {
      const replace =
        market.node.data?.market.id === 'market-2' ? null : market.node.data;
      return { ...market, node: { ...market.node, data: replace } };
    });
    const overrides = {
      ...marketData,
      marketsConnection: { ...marketData.marketsConnection, edges },
    };
    cy.mockGQL((req) => {
      aliasGQLQuery(req, 'MarketsData', overrides, errors);
    });
    cy.visit('/#/markets/market-0');
    const emptyCells = [
      'notional',
      'markPrice',
      'liquidationPrice',
      'currentLeverage',
      'averageEntryPrice',
    ];
    cy.getByTestId('tab-positions').within(() => {
      cy.get('[row-id="market-2"]').within(() => {
        emptyCells.forEach((cell) => {
          cy.get(`[col-id="${cell}"]`).should('contain.text', '-');
        });
      });
    });
  });

  describe('sorting by ag-grid columns should work well', () => {
    it('sorting by Market', () => {
      cy.visit('/#/markets/market-0');
      const marketsSortedDefault = [
        'ACTIVE MARKET',
        'Apple Monthly (30 Jun 2022)',
      ];
      const marketsSortedAsc = ['ACTIVE MARKET', 'Apple Monthly (30 Jun 2022)'];
      const marketsSortedDesc = [
        'Apple Monthly (30 Jun 2022)',
        'ACTIVE MARKET',
      ];
      cy.getByTestId('Positions').click();
      checkSorting(
        'marketName',
        marketsSortedDefault,
        marketsSortedAsc,
        marketsSortedDesc
      );
    });
    it('sorting by notional', () => {
      cy.visit('/#/markets/market-0');
      const marketsSortedDefault = ['276,761.40348', '46,126.90058'];
      const marketsSortedAsc = ['46,126.90058', '276,761.40348'];
      const marketsSortedDesc = ['276,761.40348', '46,126.90058'];
      cy.getByTestId('Positions').click();
      checkSorting(
        'notional',
        marketsSortedDefault,
        marketsSortedAsc,
        marketsSortedDesc
      );
    });
    it('sorting by unrealisedPNL', () => {
      cy.visit('/#/markets/market-0');
      const marketsSortedDefault = ['8.95', '-0.22519'];
      const marketsSortedAsc = ['-0.22519', '8.95'];
      const marketsSortedDesc = ['8.95', '-0.22519'];
      cy.getByTestId('Positions').click();
      checkSorting(
        'unrealisedPNL',
        marketsSortedDefault,
        marketsSortedAsc,
        marketsSortedDesc
      );
    });
  });

  function validatePositionsDisplayed() {
    cy.getByTestId('tab-positions').should('be.visible');
    cy.getByTestId('tab-positions').within(() => {
      cy.get('[col-id="marketName"]')
        .should('be.visible')
        .each(($marketSymbol) => {
          cy.wrap($marketSymbol).invoke('text').should('not.be.empty');
        });

      cy.get('.ag-center-cols-container [col-id="openVolume"]').each(
        ($openVolume) => {
          cy.wrap($openVolume).invoke('text').should('not.be.empty');
        }
      );

      // includes average entry price, mark price, realised PNL & leverage
      cy.getByTestId('flash-cell').each(($prices) => {
        cy.wrap($prices).invoke('text').should('not.be.empty');
      });

      cy.get('[col-id="liquidationPrice"]').should('contain.text', '0'); // liquidation price

      cy.get('[col-id="currentLeverage"]').should('contain.text', '138.446.1');

      cy.get('[col-id="marginAccountBalance"]') // margin allocated
        .should('contain.text', '1,000');

      cy.get('[col-id="unrealisedPNL"]').each(($unrealisedPnl) => {
        cy.wrap($unrealisedPnl).invoke('text').should('not.be.empty');
      });

      cy.get('[col-id="notional"]').should('contain.text', '276,761.40348'); // Total tDAI position
      cy.get('[col-id="realisedPNL"]').should('contain.text', '2.30'); // Total Realised PNL
      cy.get('[col-id="unrealisedPNL"]').should('contain.text', '8.95'); // Total Unrealised PNL

      cy.get('.ag-header-row [col-id="notional"]')
        .should('contain.text', 'Notional')
        .realHover();
      cy.get('.ag-popup').should('contain.text', 'Mark price x open volume');
    });

    cy.getByTestId('close-position').should('be.visible').and('have.length', 2);
  }
});
