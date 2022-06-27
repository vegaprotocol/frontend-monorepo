import { mockPortfolioPage } from '../support/portfolio';

describe('portfolio', () => {
  before(() => {
    cy.mockGQL((req) => {
      mockPortfolioPage(req);
    });

    cy.visit('/portfolio');
    cy.get('main[data-testid="portfolio"]').should('exist');
  });

  describe('fills', () => {
    it('renders fills', () => {
      cy.getByTestId('Positions').click();
      cy.getByTestId('tab-positions').contains('Please connect Vega wallet');
      cy.pause();
    });
  });
});
