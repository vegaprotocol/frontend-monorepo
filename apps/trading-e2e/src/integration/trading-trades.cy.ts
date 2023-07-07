const colHeader = '.ag-header-cell-text';
const colIdPrice = '[col-id=price]';
const colIdSize = '[col-id=size]';
const colIdCreatedAt = '[col-id=createdAt]';
const tradesTab = 'Trades';
const tradesTable = 'tab-trades';

describe('trades', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.mockTradingPage();
    cy.mockSubscription();
  });

  before(() => {
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.visit('/#/markets/market-0');
    cy.getByTestId(tradesTab).click();
  });

  it('show trades', () => {
    // 6005-THIS-001
    // 6005-THIS-002
    cy.getByTestId(tradesTab).should('be.visible');
    cy.getByTestId(tradesTable).should('be.visible');
    cy.getByTestId(tradesTable).should('not.be.empty');
  });

  it('show trades prices', () => {
    // 6005-THIS-003
    cy.getByTestId(tradesTable)
      .get(`${colIdPrice} ${colHeader}`)
      .first()
      .should('have.text', 'Price');
    cy.getByTestId(tradesTable)
      .get(colIdPrice)
      .each(($tradePrice) => {
        cy.wrap($tradePrice).invoke('text').should('not.be.empty');
      });
  });

  it('show trades sizes', () => {
    // 6005-THIS-004
    cy.getByTestId(tradesTable)
      .get(`${colIdSize} ${colHeader}`)
      .first()
      .should('have.text', 'Size');
    cy.getByTestId(tradesTable)
      .get(colIdSize)
      .each(($tradeSize) => {
        cy.wrap($tradeSize).invoke('text').should('not.be.empty');
      });
  });

  // This won't pass in CI, but does locally
  it.skip('show trades date and time', () => {
    // 6005-THIS-005
    cy.getByTestId(tradesTable) // order table shares identical col id
      .find(`${colIdCreatedAt} ${colHeader}`)
      .should('have.text', 'Created at');
    const dateTimeRegex =
      /(\d{1,2})\/(\d{1,2})\/(\d{4}), (\d{1,2}):(\d{1,2}):(\d{1,2})/gm;
    cy.getByTestId(tradesTable)
      .get(`.ag-center-cols-container ${colIdCreatedAt}`)
      .each(($tradeDateTime) => {
        cy.wrap($tradeDateTime).invoke('text').should('match', dateTimeRegex);
      });
  });

  it('trades are sorted descending by datetime', () => {
    // 6005-THIS-006
    const dateTimes: Date[] = [];
    cy.getByTestId(tradesTable)
      .find(colIdCreatedAt)
      .each(($tradeDateTime, index) => {
        if (index != 0) {
          //ignore header
          dateTimes.push(new Date($tradeDateTime.text()));
        }
      })
      .then(() => {
        expect(dateTimes).to.deep.equal(
          dateTimes.sort((a, b) => b.getTime() - a.getTime())
        );
      });
  });

  it.skip('copy price to deal ticket form', () => {
    cy.getByTestId('order-type-TYPE_LIMIT').click(); // make sure on limit
    // 6005-THIS-007
    cy.getByTestId(tradesTable)
      .find(colIdPrice)
      .last()
      .should('be.visible')
      .click();
    cy.getByTestId('order-price').should('have.value', '171.16898');
  });
});
