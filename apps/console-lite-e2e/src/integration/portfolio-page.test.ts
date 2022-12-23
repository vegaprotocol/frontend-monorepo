import { aliasGQLQuery } from '@vegaprotocol/cypress';
import {
  accountsQuery,
  assetsQuery,
  chainIdQuery,
  fillsQuery,
  marginsQuery,
  marketsDataQuery,
  marketsQuery,
  ordersQuery,
  positionsQuery,
  statisticsQuery,
} from '@vegaprotocol/mock';

describe('Portfolio page - wallet', { tags: '@smoke' }, () => {
  it('button for wallet connect should work', () => {
    cy.visit('/');
    cy.get('[href="/portfolio"]').eq(0).click();
    cy.getByTestId('trading-connect-wallet').should('be.visible');
    cy.connectVegaWallet();
    cy.getByTestId('trading-connect-wallet').should('not.exist');
  });
});

describe('Portfolio page tabs', { tags: '@smoke' }, () => {
  before(() => {
    cy.mockGQL((req) => {
      aliasGQLQuery(req, 'ChainId', chainIdQuery());
      aliasGQLQuery(req, 'Statistics', statisticsQuery());
      aliasGQLQuery(req, 'Positions', positionsQuery());
      aliasGQLQuery(req, 'Margins', marginsQuery());
      aliasGQLQuery(req, 'Markets', marketsQuery());
      aliasGQLQuery(req, 'MarketsData', marketsDataQuery());
      aliasGQLQuery(req, 'Accounts', accountsQuery());
      aliasGQLQuery(req, 'Assets', assetsQuery());
    });
  });

  it('certain tabs should exist', () => {
    cy.visit('/portfolio');
    cy.connectVegaWallet();

    cy.getByTestId('assets').click();
    cy.location('pathname').should('eq', '/portfolio/assets');

    cy.getByTestId('positions').click();
    cy.location('pathname').should('eq', '/portfolio/positions');

    cy.getByTestId('orders').click();
    cy.location('pathname').should('eq', '/portfolio/orders');

    cy.getByTestId('fills').click();
    cy.location('pathname').should('eq', '/portfolio/fills');

    cy.getByTestId('deposits').click();
    cy.location('pathname').should('eq', '/portfolio/deposits');
  });

  describe('Assets view', () => {
    before(() => {
      cy.mockGQL((req) => {
        aliasGQLQuery(req, 'ChainId', chainIdQuery());
        aliasGQLQuery(req, 'Statistics', statisticsQuery());
        aliasGQLQuery(req, 'Positions', positionsQuery());
        aliasGQLQuery(req, 'Margins', marginsQuery());
        aliasGQLQuery(req, 'Markets', marketsQuery());
        aliasGQLQuery(req, 'MarketsData', marketsDataQuery());
        aliasGQLQuery(req, 'Accounts', accountsQuery());
        aliasGQLQuery(req, 'Assets', assetsQuery());
      });
      cy.visit('/portfolio/assets');
      cy.connectVegaWallet();
    });

    it('data should be properly rendered', () => {
      cy.get('.ag-center-cols-container .ag-row').should('have.length', 5);
      cy.get(
        '.ag-center-cols-container [row-id="ACCOUNT_TYPE_GENERAL-asset-id-null"]'
      )
        .find('button')
        .click();
      cy.getByTestId('dialog-title').should(
        'have.text',
        'Asset details - tEURO'
      );
      cy.getByTestId('dialog-close').click();
    });
  });

  describe('Positions view', () => {
    beforeEach(() => {
      cy.mockGQL((req) => {
        aliasGQLQuery(req, 'ChainId', chainIdQuery());
        aliasGQLQuery(req, 'Statistics', statisticsQuery());
        aliasGQLQuery(req, 'Positions', positionsQuery());
        aliasGQLQuery(req, 'Margins', marginsQuery());
        aliasGQLQuery(req, 'Markets', marketsQuery());
        aliasGQLQuery(req, 'MarketsData', marketsDataQuery());
        aliasGQLQuery(req, 'Accounts', accountsQuery());
        aliasGQLQuery(req, 'Assets', assetsQuery());
      });
      cy.visit('/portfolio/positions');
      cy.connectVegaWallet();
    });

    it('data should be properly rendered', () => {
      cy.get('.ag-center-cols-container .ag-row').should('have.length', 2);
    });
  });

  describe('Orders view', () => {
    beforeEach(() => {
      cy.mockGQL((req) => {
        aliasGQLQuery(req, 'ChainId', chainIdQuery());
        aliasGQLQuery(req, 'Statistics', statisticsQuery());
        aliasGQLQuery(req, 'Orders', ordersQuery());
        aliasGQLQuery(req, 'Markets', marketsQuery());
      });
      cy.visit('/portfolio/orders');
      cy.connectVegaWallet();
    });

    it('data should be properly rendered', () => {
      cy.get('.ag-center-cols-container .ag-row').should('have.length', 5);
    });
  });

  describe('Fills view', () => {
    beforeEach(() => {
      cy.mockGQL((req) => {
        aliasGQLQuery(req, 'ChainId', chainIdQuery());
        aliasGQLQuery(req, 'Statistics', statisticsQuery());
        aliasGQLQuery(req, 'Orders', ordersQuery());
        aliasGQLQuery(req, 'Markets', marketsQuery());
        aliasGQLQuery(req, 'Fills', fillsQuery());
      });
      cy.visit('/portfolio/fills');
      cy.connectVegaWallet();
    });

    it('data should be properly rendered', () => {
      cy.get('.ag-center-cols-container .ag-row').should('have.length', 4);
    });
  });

  describe('Empty views', () => {
    beforeEach(() => {
      cy.mockGQL((req) => {
        aliasGQLQuery(req, 'ChainId', chainIdQuery());
        aliasGQLQuery(req, 'Statistics', statisticsQuery());
        aliasGQLQuery(req, 'Positions', { party: null });
        aliasGQLQuery(req, 'Accounts', { party: null });
        aliasGQLQuery(req, 'Orders', { party: null });
        aliasGQLQuery(req, 'Fills', { party: null });
        aliasGQLQuery(req, 'Markets', {
          marketsConnection: { edges: [], __typename: 'MarketConnection' },
        });
        aliasGQLQuery(req, 'Assets', {
          assetsConnection: { edges: null, __typename: 'AssetsConnection' },
        });
        aliasGQLQuery(req, 'Margins', marginsQuery());
        aliasGQLQuery(req, 'MarketsData', marketsDataQuery());
      });
      cy.visit('/portfolio');
      cy.connectVegaWallet();
    });

    it('"No data to display" should be always displayed', () => {
      cy.getByTestId('assets').click();
      cy.get('div.flex.items-center.justify-center').should(
        'contain.text',
        'No data to display'
      );

      cy.getByTestId('positions').click();
      cy.get('div.flex.items-center.justify-center').should(
        'contain.text',
        'No data to display'
      );

      cy.getByTestId('orders').click();
      cy.get('div.flex.items-center.justify-center').should(
        'contain.text',
        'No data to display'
      );

      cy.getByTestId('fills').click();
      cy.get('div.flex.items-center.justify-center').should(
        'contain.text',
        'No data to display'
      );
    });
  });
});
