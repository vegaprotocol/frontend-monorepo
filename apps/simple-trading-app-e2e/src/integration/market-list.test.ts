import { aliasQuery } from '@vegaprotocol/cypress';
import {
  generateLongListMarkets,
  generateSimpleMarkets,
} from '../support/mocks/generate-markets';

describe('market list', () => {
  describe('simple url', () => {
    beforeEach(() => {
      cy.mockGQL((req) => {
        aliasQuery(req, 'SimpleMarkets', generateSimpleMarkets());
      });
      cy.visit('/markets');
    });

    it('selects menus', () => {
      cy.get('[aria-label="Sidebar Navigation Menu"] [aria-current]').should(
        'have.text',
        'Markets'
      );
      cy.getByTestId('state-trigger').should('have.text', 'Active');
      cy.get('[aria-label="Future"]').click();
      cy.get('[data-testid="market-assets-menu"] a.active').should(
        'have.text',
        'All'
      );
    });

    it('navigation should make possibly shortest url', () => {
      cy.location('pathname').should('equal', '/markets');

      cy.getByTestId('state-trigger').click();
      cy.get('[role=menuitemcheckbox]').contains('All').click();
      cy.location('pathname').should('equal', '/markets/all');

      cy.get('[aria-label="Future"]').click();
      cy.location('pathname').should('eq', '/markets/all/Future');
      let asset = '';
      cy.getByTestId('market-assets-menu')
        .children()
        .then((children) => {
          if (children.length > 1) {
            asset = children[1].innerText;
            if (asset) {
              cy.wrap(children[1]).click();
              cy.location('pathname').should(
                'match',
                new RegExp(`/markets/all/Future/${asset}`, 'i')
              );
              cy.get('a').contains('All Markets').click();
              cy.location('pathname').should('eq', '/markets/all');
            }
          }
        });

      cy.getByTestId('state-trigger').click();
      cy.get('[role=menuitemcheckbox]').contains('Active').click();
      cy.location('pathname').should('equal', '/markets');
    });
  });

  describe('url params should select filters', () => {
    beforeEach(() => {
      cy.mockGQL((req) => {
        aliasQuery(req, 'SimpleMarkets', generateSimpleMarkets());
      });
    });

    it('suspended status', () => {
      cy.visit('/markets/Suspended');
      cy.getByTestId('state-trigger').should('have.text', 'Suspended');
    });

    it('last asset (if exists)', () => {
      cy.visit('/markets');
      cy.wait('@SimpleMarkets').then((filters) => {
        if (filters?.response?.body?.data?.markets?.length) {
          const asset =
            filters.response.body.data.markets[0].tradableInstrument.instrument
              .product.settlementAsset.symbol;
          cy.visit(`/markets/Suspended/Future/${asset}`);
          cy.getByTestId('market-assets-menu')
            .find('a.active')
            .should('have.text', asset);
        }
      });
    });

    it('Future product', () => {
      cy.visit('/markets/Suspended/Future');
      cy.getByTestId('market-products-menu')
        .find('a.active')
        .should('have.text', 'Future');
    });
  });

  describe('long list of results should be handled properly', () => {
    it('handles 5000 markets', () => {
      cy.viewport(1440, 900);
      cy.mockGQL((req) => {
        aliasQuery(req, 'SimpleMarkets', generateLongListMarkets(5000));
      });
      performance.mark('start-5k');
      cy.visit('/markets');
      cy.get('.ag-center-cols-container', { timeout: 50000 }).then(() => {
        performance.mark('end-5k');
        performance.measure('load-5k', 'start-5k', 'end-5k');
        const measure = performance.getEntriesByName('load-5k')[0];
        expect(measure.duration).lte(3000);
        cy.log(`Ag-grid 5k load took ${measure.duration} milliseconds.`);

        cy.get('.ag-root').should('have.attr', 'aria-rowcount', '5001');
        cy.get('.ag-center-cols-container')
          .find('[role="row"]')
          .should('have.length', 21);
        cy.get('.ag-cell-label-container').eq(4).click();
        for (let i = 0; i < 50; i++) {
          cy.get('body').realPress('Tab');
        }
        cy.focused().parent('.ag-row').should('have.attr', 'row-index', '49');
        cy.get('.ag-center-cols-container')
          .find('[role="row"]')
          .should('have.length', 31);
      });
    });

    it('handles 50000 markets', () => {
      cy.viewport(1440, 900);
      cy.mockGQL(async (req) => {
        aliasQuery(req, 'SimpleMarkets', generateLongListMarkets(50000));
      });
      performance.mark('start-50k');
      cy.visit('/markets');
      cy.get('.w-full.h-full.flex.items-center.justify-center').should(
        'have.text',
        'Loading...'
      );
      cy.get('.ag-center-cols-container', { timeout: 50000 }).then(() => {
        performance.mark('end-50k');
        performance.measure('load-50k', 'start-50k', 'end-50k');
        const measure = performance.getEntriesByName('load-50k')[0];
        expect(measure.duration).lte(20000);
        cy.log(`Ag-grid 50k load took ${measure.duration} milliseconds.`);

        cy.get('.ag-root').should('have.attr', 'aria-rowcount', '50001');
        cy.get('.ag-center-cols-container')
          .find('[role="row"]')
          .should('have.length', 21);
        cy.get('.ag-cell-label-container').eq(4).click();
        for (let i = 0; i < 50; i++) {
          cy.get('body').realPress('Tab');
        }
        cy.focused().parent('.ag-row').should('have.attr', 'row-index', '49');
        cy.get('.ag-center-cols-container')
          .find('[role="row"]')
          .should('have.length', 31);
      });
    });
  });
});
