import { aliasGQLQuery, checkSorting } from '@vegaprotocol/cypress';
import type { ProposalsListQuery } from '@vegaprotocol/proposals';

const rowSelector =
  '[data-testid="tab-proposed-markets"] .ag-center-cols-container .ag-row';
const colMarketId = '[col-id="market"]';

describe('markets proposed table', { tags: '@smoke' }, () => {
  before(() => {
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.visit('/#/markets/all');
    cy.get('[data-testid="Proposed markets"]').click();
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
    cy.get(rowSelector).first().find(colMarketId).should('have.text', 'ETHUSD');

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
      .should('not.be.empty');

    //  6001-MARK-057
    cy.get(rowSelector)
      .first()
      .find('[col-id="enactment-date"]')
      .should('not.be.empty');
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
    // 6001-MARK-062
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

  it('can drag and drop columns', () => {
    // 6001-MARK-063
    cy.get(colMarketId).realMouseDown().realMouseMove(700, 15).realMouseUp();
    cy.get(colMarketId).should(($element) => {
      const attributeValue = $element.attr('aria-colindex');
      expect(attributeValue).not.to.equal('1');
    });
  });
});

describe('no markets proposed', { tags: '@smoke', testIsolation: true }, () => {
  before(() => {
    cy.mockTradingPage();
    const proposal: ProposalsListQuery = {};
    cy.mockGQL((req) => {
      aliasGQLQuery(req, 'ProposalsList', proposal);
    });
    cy.mockSubscription();
    cy.visit('/#/markets/all');
    cy.get('[data-testid="Proposed markets"]').click();
  });

  it('can see no markets message', () => {
    // 6001-MARK-061
    cy.getByTestId('tab-proposed-markets').should('contain.text', 'No markets');
  });
});
