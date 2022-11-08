import { aliasQuery } from '@vegaprotocol/cypress';
import {
  generateSimpleMarkets,
  generateMarketsCandles,
} from '../support/mocks/generate-markets';

describe('simple trading app', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.mockGQL((req) => {
      aliasQuery(req, 'Markets', generateSimpleMarkets());
      aliasQuery(req, 'MarketsCandles', generateMarketsCandles());
    });
    cy.visit('/');
  });

  it('render', () => {
    console.log('test');
    cy.get('#root').should('exist');
  });
});
