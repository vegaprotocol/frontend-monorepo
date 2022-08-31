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
    it('handles 1000 markets', () => {
      cy.viewport(1440, 900);
      cy.mockGQL((req) => {
        aliasQuery(req, 'SimpleMarkets', generateLongListMarkets(1000));
      });
      performance.mark('start-1k');
      cy.visit('/markets');
      cy.get('.ag-center-cols-container', { timeout: 50000 }).then(() => {
        performance.mark('end-1k');
        performance.measure('load-1k', 'start-1k', 'end-1k');
        const measure = performance.getEntriesByName('load-1k')[0];
        expect(measure.duration).lte(20000);
        cy.log(`Ag-grid 1k load took ${measure.duration} milliseconds.`);

        cy.get('.ag-root').should('have.attr', 'aria-rowcount', '1001');
        cy.get('.ag-center-cols-container')
          .find('[role="row"]')
          .its('length')
          .then((length) => expect(length).to.be.closeTo(20, 3));
        cy.get('.ag-cell-label-container').eq(4).click();
        cy.get('body').then(($body) => {
          for (let i = 0; i < 15; i++) {
            cy.wrap($body).realPress('Tab', { pressDelay: 100 });
          }
        });
        cy.focused().parent('.ag-row').should('have.attr', 'row-index', '14');
        cy.get('.ag-center-cols-container')
          .find('[role="row"]')
          .its('length')
          .then((length) => expect(length).to.be.closeTo(26, 2));
      });
    });
  });
});
