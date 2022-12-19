import { aliasQuery } from '@vegaprotocol/cypress';
import {
  generatePositions,
  emptyPositions,
  generateMargins,
} from '../support/mocks/generate-positions';
import { generateAccounts } from '../support/mocks/generate-accounts';
import { generateAssets } from '../support/mocks/generate-assets';
import { generateOrders } from '../support/mocks/generate-orders';
import { generateFills } from '../support/mocks/generate-fills';
import {
  generateFillsMarkets,
  generateMarketsData,
  generatePositionsMarkets,
} from '../support/mocks/generate-markets';
import { generateChainId } from '../support/mocks/generate-chain-id';
import { generateStatistics } from '../support/mocks/generate-statistics';

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
      aliasQuery(req, 'ChainId', generateChainId());
      aliasQuery(req, 'Statistics', generateStatistics());
      aliasQuery(req, 'Positions', generatePositions());
      aliasQuery(req, 'Margins', generateMargins());
      aliasQuery(req, 'Markets', generatePositionsMarkets());
      aliasQuery(req, 'MarketsData', generateMarketsData());
      aliasQuery(req, 'Accounts', generateAccounts());
      aliasQuery(req, 'Assets', generateAssets());
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
        aliasQuery(req, 'ChainId', generateChainId());
        aliasQuery(req, 'Statistics', generateStatistics());
        aliasQuery(req, 'Positions', generatePositions());
        aliasQuery(req, 'Margins', generateMargins());
        aliasQuery(req, 'Markets', generatePositionsMarkets());
        aliasQuery(req, 'MarketsData', generateMarketsData());
        aliasQuery(req, 'Accounts', generateAccounts());
        aliasQuery(req, 'Assets', generateAssets());
      });
      cy.visit('/portfolio/assets');
      cy.connectVegaWallet();
    });

    it('data should be properly rendered', () => {
      cy.get('.ag-center-cols-container .ag-row').should('have.length', 3);
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
        aliasQuery(req, 'ChainId', generateChainId());
        aliasQuery(req, 'Statistics', generateStatistics());
        aliasQuery(req, 'Positions', generatePositions());
        aliasQuery(req, 'Accounts', generateAccounts());
        aliasQuery(req, 'Margins', generateMargins());
        aliasQuery(req, 'Markets', generatePositionsMarkets());
        aliasQuery(req, 'MarketsData', generateMarketsData());
        aliasQuery(req, 'Assets', generateAssets());
      });
      cy.visit('/portfolio/positions');
      cy.connectVegaWallet();
    });

    it('data should be properly rendered', () => {
      cy.get('.ag-center-cols-container .ag-row').should('have.length', 1);
    });
  });

  describe('Orders view', () => {
    beforeEach(() => {
      cy.mockGQL((req) => {
        aliasQuery(req, 'ChainId', generateChainId());
        aliasQuery(req, 'Statistics', generateStatistics());
        aliasQuery(req, 'Orders', generateOrders());
        aliasQuery(req, 'Markets', generateFillsMarkets());
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
        aliasQuery(req, 'ChainId', generateChainId());
        aliasQuery(req, 'Statistics', generateStatistics());
        aliasQuery(req, 'Fills', generateFills());
        aliasQuery(req, 'Markets', generateFillsMarkets());
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
        aliasQuery(req, 'ChainId', generateChainId());
        aliasQuery(req, 'Statistics', generateStatistics());
        aliasQuery(req, 'Positions', emptyPositions());
        aliasQuery(req, 'Accounts', { party: null });
        aliasQuery(req, 'Orders', { party: null });
        aliasQuery(req, 'Fills', { party: null });
        aliasQuery(req, 'Markets', {
          marketsConnection: { edges: [], __typename: 'MarketConnection' },
        });
        aliasQuery(req, 'Assets', {
          assetsConnection: { edges: null, __typename: 'AssetsConnection' },
        });
        aliasQuery(req, 'Margins', generateMargins());
        aliasQuery(req, 'MarketsData', generateMarketsData());
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
