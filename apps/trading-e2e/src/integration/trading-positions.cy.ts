import { checkSorting, aliasGQLQuery } from '@vegaprotocol/cypress';
import { marketsDataQuery } from '@vegaprotocol/mock';
import { positionsQuery } from '@vegaprotocol/mock';

// #region consts
const closePosition = 'close-position';
const dialogCloseX = 'dialog-close';
const dialogContent = 'dialog-content';
const dropDownMenu = 'dropdown-menu';
const marketActionsContent = 'market-actions-content';
const positions = 'Positions';
const tabPositions = 'tab-positions';
const toastContent = 'toast-content';
const tooltipContent = 'tooltip-content';
// #endregion

describe('positions', { tags: '@smoke', testIsolation: true }, () => {
  beforeEach(() => {
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.setVegaWallet();
  });
  it('renders positions on trading page', () => {
    visitAndClickPositions();
    // 7004-POSI-001
    // 7004-POSI-002
    validatePositionsDisplayed();
  });

  it('renders positions on portfolio page', () => {
    cy.mockGQL((req) => {
      const positions = positionsQuery();
      if (positions.positions?.edges) {
        positions.positions.edges.push(
          ...positions.positions.edges.map((edge) => ({
            ...edge,
            node: {
              ...edge.node,
              party: {
                ...edge.node.party,
                id: 'vega-1',
              },
            },
          }))
        );
      }
      aliasGQLQuery(req, 'Positions', positions);
    });
    visitAndClickPositions();
    // 7004-POSI-001
    // 7004-POSI-002
    validatePositionsDisplayed(true);
  });

  it('Close my position', () => {
    visitAndClickPositions();
    cy.getByTestId(closePosition).first().click();
    // 7004-POSI-010
    cy.getByTestId(toastContent).should(
      'contain.text',
      'Awaiting confirmation'
    );
  });
});

describe('positions', { tags: '@regression', testIsolation: true }, () => {
  beforeEach(() => {
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.setVegaWallet();
  });

  it('rows should be displayed despite errors', () => {
    const errors = [
      {
        message:
          'no market data for market: 9c55fb644c6f7de5422d40d691a62bffd5898384c70135bab29ba1e3e2e5280a',
        path: ['marketsConnection', 'edges'],
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
      'currentLeverage',
      'averageEntryPrice',
    ];
    cy.getByTestId(tabPositions)
      .first()
      .within(() => {
        cy.get(
          '[row-id="02eceaba4df2bef76ea10caf728d8a099a2aa846cced25737cccaa9812342f65-market-2"]'
        )
          .eq(1)
          .within(() => {
            emptyCells.forEach((cell) => {
              cy.get(`[col-id="${cell}"]`).should('contain.text', '-');
            });
          });
      });
  });

  it('error message should be displayed', () => {
    const errors = [
      {
        message:
          'no market data for asset: 9c55fb644c6f7de5422d40d691a62bffd5898384c70135bab29ba1e3e2e5280a',
        path: ['assets', 'edges'],
        extensions: {
          code: 13,
          type: 'Internal',
        },
      },
    ];
    const overrides = {
      marketsConnection: { edges: [] },
    };
    cy.mockGQL((req) => {
      aliasGQLQuery(req, 'MarketsData', overrides, errors);
    });
    cy.visit('/#/markets/market-0');
    cy.getByTestId(tabPositions).contains('no market data');
  });

  it('sorting by Market', () => {
    visitAndClickPositions();
    const marketsSortedDefault = [
      'ACTIVE MARKET',
      'Apple Monthly (30 Jun 2022)',
      'ETHBTC Quarterly (30 Jun 2022)',
      'SUSPENDED MARKET',
    ];
    const marketsSortedAsc = [
      'ACTIVE MARKET',
      'Apple Monthly (30 Jun 2022)',
      'ETHBTC Quarterly (30 Jun 2022)',
      'SUSPENDED MARKET',
    ];
    const marketsSortedDesc = [
      'SUSPENDED MARKET',
      'ETHBTC Quarterly (30 Jun 2022)',
      'Apple Monthly (30 Jun 2022)',
      'ACTIVE MARKET',
    ];
    cy.getByTestId(positions).click();
    // 7004-POSI-003
    checkSorting(
      'marketName',
      marketsSortedDefault,
      marketsSortedAsc,
      marketsSortedDesc
    );
  });

  // let elementWidth: number;

  it('Resize column', () => {
    visitAndClickPositions();
    cy.get('.ag-overlay-loading-wrapper').should('not.be.visible');
    cy.get('.ag-header-container').within(() => {
      cy.get(`[col-id="marketName"]`)
        .find('.ag-header-cell-resize')
        .realMouseDown()
        .realMouseMove(250, 0)
        .realMouseUp();
    });

    // 7004-POSI-006
    cy.get(`[col-id="marketName"]`)
      .invoke('width')
      .should('be.greaterThan', 250);
  });

  // This test depends on the previous one
  it('Has persisted column widths', () => {
    const width = 400;

    cy.window().then((win) => {
      win.localStorage.setItem(
        'vega_positions_store',
        JSON.stringify({
          state: {
            gridStore: {
              columnState: [{ colId: 'marketName', width }],
            },
          },
        })
      );
    });

    visitAndClickPositions();

    // 7004-POSI-012
    cy.get('.ag-center-cols-container .ag-row')
      .first()
      .find('[col-id="marketName"]')
      .invoke('outerWidth')
      .should('equal', width);
  });

  it('Scroll horizontally', () => {
    visitAndClickPositions();

    cy.get('.ag-header-container').within(() => {
      cy.get(`[col-id="marketName"]`)
        .find('.ag-header-cell-resize')
        .realMouseDown()
        .realMouseMove(400, 0)
        .realMouseUp();
    });
    cy.get('[col-id="marketName"]').should('be.visible');
    cy.get('.ag-body-horizontal-scroll-viewport').realMouseWheel({
      deltaX: 500,
    });
    // 7004-POSI-004
    cy.get('[col-id="updatedAt"]').should('be.visible');
  });

  it('Drag and drop columns', () => {
    visitAndClickPositions();
    cy.get('.ag-overlay-loading-wrapper').should('not.be.visible');
    cy.get('[col-id="marketName"]')
      .realMouseDown()
      .realMouseMove(700, 15)
      .realMouseUp();

    // 7004-POSI-005
    cy.get('[col-id="marketName"]').should(($element) => {
      const attributeValue = $element.attr('aria-colindex');
      expect(attributeValue).not.to.equal('1');
    });
  });

  it('I can see warnings', () => {
    visitAndClickPositions();

    cy.get('[col-id="openVolume"]').within(() => {
      cy.get('[aria-label="warning-sign icon"]')
        .should('be.visible')
        .realHover();
    });
    // 7004-POSI-011
    cy.getByTestId(tooltipContent).should('be.visible');
  });

  it('Positive and Negative color change', () => {
    cy.visit('/#/markets/market-0');
    cy.getByTestId(positions).click();
    // 7004-POSI-007
    cy.get('.ag-center-cols-container').within(() => {
      assertPNLColor(
        '[col-id="realisedPNL"]',
        'text-vega-green',
        'text-vega-pink'
      );
    });
    cy.get('.ag-center-cols-container').within(() => {
      assertPNLColor(
        '[col-id="unrealisedPNL"]',
        'text-vega-green',
        'text-vega-pink'
      );
    });
    cy.get('.ag-center-cols-container').within(() => {
      assertPNLColor(
        '[col-id="openVolume"]',
        'text-vega-green',
        'text-vega-pink'
      );
    });
  });

  it('View settlement asset', () => {
    visitAndClickPositions();
    cy.get('[col-id="asset"]').within(() => {
      cy.get('button[type="button"]').first().click();
    });
    // 7004-POSI-008
    cy.getByTestId(dialogContent).should('be.visible');
    cy.getByTestId(dialogCloseX).click();
    cy.getByTestId(dropDownMenu).first().click();
    cy.getByTestId(marketActionsContent).click();
    // 7004-POSI-009
    cy.getByTestId(dialogContent).should('be.visible');
  });
});

function validatePositionsDisplayed(multiKey = false) {
  cy.getByTestId('tab-positions').should('be.visible');
  cy.getByTestId('tab-positions')
    .get('.ag-center-cols-container .ag-row')
    .first()
    .within(() => {
      cy.get('[col-id="marketName"]')
        .should('be.visible')
        .invoke('text')
        .should('not.be.empty');

      cy.get('[col-id="openVolume"]').should('not.be.empty');

      // includes average entry price, mark price, realised PNL & leverage
      cy.getByTestId('flash-cell').should('not.be.empty');

      if (!multiKey) {
        cy.get('[col-id="currentLeverage"]').should('contain.text', '2,767.3');
        cy.get('[col-id="marginAccountBalance"]') // margin allocated
          .should('contain.text', '0.01');
      }

      cy.get('[col-id="unrealisedPNL"]').should('not.be.empty');
      cy.get('[col-id="notional"]').should('contain.text', '276,761.40348'); // Total tDAI position
      cy.get('[col-id="realisedPNL"]').should('contain.text', '2.30'); // Total Realised PNL
      cy.get('[col-id="unrealisedPNL"]').should('contain.text', '8.95'); // Total Unrealised PNL
    });

  cy.get('.ag-header-row [col-id="notional"]')
    .should('contain.text', 'Notional')
    .realHover();
  cy.get('.ag-popup').should('contain.text', 'Mark price x open volume');

  cy.getByTestId('close-position').should('be.visible').and('have.length', 3);
}

function assertPNLColor(
  pnlSelector: string,
  positiveClass: string,
  negativeClass: string
) {
  cy.get(pnlSelector).each(($el) => {
    const value = parseFloat($el.text());

    if (value > 0) {
      cy.wrap($el).invoke('attr', 'class').should('contain', positiveClass);
    } else if (value < 0) {
      cy.wrap($el).invoke('attr', 'class').should('contain', negativeClass);
    } else if (value == 0) {
      cy.wrap($el)
        .invoke('attr', 'class')
        .should('not.contain', negativeClass, positiveClass);
    } else {
      throw new Error('Unexpected value');
    }
  });
}

function visitAndClickPositions() {
  cy.visit('/#/markets/market-0');
  cy.getByTestId(positions).click();
}
