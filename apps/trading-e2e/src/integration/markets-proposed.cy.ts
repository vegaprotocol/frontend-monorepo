import { checkSorting } from '@vegaprotocol/cypress';

const rowSelector =
  '[data-testid="tab-proposed-markets"] .ag-center-cols-container .ag-row';

describe('markets proposed table', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.clearLocalStorage().then(() => {
      cy.mockTradingPage();
      cy.mockSubscription();
      cy.visit('/#/markets/all');
      cy.get('[data-testid="Proposed markets"]').click();
    });
  });

  it('can see table headers', () => {
    const headers = [
      'Market',
      'Description',
      'Settlement asset',
      'State',
      'Voting',
      'Closing date',
      'Enactment date',
      '',
    ];
    cy.getByTestId('tab-proposed-markets').within(($headers) => {
      cy.wrap($headers)
        .get('.ag-header-cell-text')
        .each(($header, i) => {
          cy.wrap($header).should('have.text', headers[i]);
        });
    });
  });

  it('renders markets correctly', () => {
    // 6001-MARK-049
    cy.get(rowSelector)
      .first()
      .find('[col-id="market"]')
      .should('have.text', 'ETHUSD');

    //  6001-MARK-050
    cy.get(rowSelector)
      .first()
      .find('[col-id="description"]')
      .should('have.text', 'ETHUSD');

    //  6001-MARK-051
    cy.get(rowSelector)
      .first()
      .find('[col-id="asset"]')
      .should('have.text', 'tDAI TEST');

    //  6001-MARK-052
    //  6001-MARK-053
    cy.get(rowSelector)
      .first()
      .find('[col-id="state"]')
      .should('have.text', 'Open');

    //  6001-MARK-054
    cy.get(rowSelector)
      .first()
      .find('[col-id="voting"]')
      .should('have.text', '');

    //  6001-MARK-056
    cy.get(rowSelector)
      .first()
      .find('[col-id="closing-date"]')
      .should('have.text', '15/11/2022, 13:44:34');

    //  6001-MARK-057
    cy.get(rowSelector)
      .first()
      .find('[col-id="enactment-date"]')
      .should('have.text', '15/11/2022, 13:44:54');
  });

  it('can open row actions', () => {
    // 6001-MARK-058
    cy.get('.ag-pinned-right-cols-container')
      .find('[col-id="proposal-actions"]')
      .first()
      .find('button')
      .click();

    const dropdownContent = '[data-testid="market-actions-content"]';
    const dropdownContentItem = '[role="menuitem"]';

    // 6001-MARK-059
    cy.get(dropdownContent)
      .find(dropdownContentItem)
      .eq(0)
      .find('a')
      .should('have.text', 'View proposal')
      .and(
        'have.attr',
        'href',
        `${Cypress.env(
          'VEGA_TOKEN_URL'
        )}/proposals/e9ec6d5c46a7e7bcabf9ba7a893fa5a5eeeec08b731f06f7a6eb7bf0e605b829`
      );
    cy.getByTestId('market-actions-content').click();
  });

  // 6001-MARK-060
  it('can see proposed market link', () => {
    cy.getByTestId('tab-proposed-markets')
      .find('[data-testid="external-link"]')
      .should('have.length', 11)
      .last()
      .should('have.text', 'Propose a new market')
      .and(
        'have.attr',
        'href',
        `${Cypress.env('VEGA_TOKEN_URL')}/proposals/propose/new-market`
      );
  });
  it('proposed markets tab should be sorted properly', () => {
    cy.get('[data-testid="Proposed markets"]').click({ force: true });
    const marketColDefault = [
      'ETHUSD',
      'LINKUSD',
      'ETHUSD',
      'ETHDAI.MF21',
      'AAPL.MF21',
      'BTCUSD.MF21',
      'TSLA.QM21',
      'AAVEDAI.MF21',
      'ETHBTC.QM21',
      'UNIDAI.MF21',
    ];
    const marketColAsc = [
      'AAPL.MF21',
      'AAVEDAI.MF21',
      'BTCUSD.MF21',
      'ETHBTC.QM21',
      'ETHDAI.MF21',
      'ETHUSD',
      'ETHUSD',
      'LINKUSD',
      'TSLA.QM21',
      'UNIDAI.MF21',
    ];
    const marketColDesc = [
      'UNIDAI.MF21',
      'TSLA.QM21',
      'LINKUSD',
      'ETHUSD',
      'ETHUSD',
      'ETHDAI.MF21',
      'ETHBTC.QM21',
      'BTCUSD.MF21',
      'AAVEDAI.MF21',
      'AAPL.MF21',
    ];
    checkSorting('market', marketColDefault, marketColAsc, marketColDesc);

    const stateColDefault = [
      'Open',
      'Passed',
      'Waiting for Node Vote',
      'Open',
      'Passed',
      'Open',
      'Passed',
      'Open',
      'Waiting for Node Vote',
      'Open',
    ];
    const stateColAsc = [
      'Open',
      'Open',
      'Open',
      'Open',
      'Open',
      'Passed',
      'Passed',
      'Passed',
      'Waiting for Node Vote',
      'Waiting for Node Vote',
    ];
    const stateColDesc = [
      'Waiting for Node Vote',
      'Waiting for Node Vote',
      'Passed',
      'Passed',
      'Passed',
      'Open',
      'Open',
      'Open',
      'Open',
      'Open',
    ];
    checkSorting('state', stateColDefault, stateColAsc, stateColDesc);
  });
});
