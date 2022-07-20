describe('market selector', () => {
  let markets;
  before(() => {
    cy.intercept('POST', '/query', (req) => {
      const { body } = req;
      if (body.operationName === 'SimpleMarkets') {
        req.alias = `gqlSimpleMarketsQuery`;
      }
    });
    cy.visit('/markets');
    cy.wait('@gqlSimpleMarketsQuery').then((response) => {
      if (response.response.body.data?.markets?.length) {
        markets = response.response.body.data.markets;
      }
    });
  });

  it('should be properly rendered', () => {
    if (markets?.length) {
      cy.visit(`/trading/${markets[0].id}`);
      cy.get('input[placeholder="Search"]').should(
        'have.value',
        markets[0].name
      );
      cy.getByTestId('arrow-button').click();
      cy.getByTestId('market-pane').should('be.visible');
      cy.getByTestId('market-pane')
        .children()
        .find('[role="button"]')
        .should('contain.text', markets[0].name);
      cy.getByTestId('market-pane').children().find('[role="button"]').click();
      cy.getByTestId('market-pane').should('not.be.visible');
    }
  });

  it('typing should change list', () => {
    if (markets?.length) {
      cy.visit(`/trading/${markets[0].id}`);
      cy.get('input[placeholder="Search"]').type('{backspace}');
      cy.getByTestId('market-pane')
        .children()
        .find('[role="button"]')
        .should('have.length', 1);
      cy.get('input[placeholder="Search"]').clear();
      cy.get('input[placeholder="Search"]').type('app');
      const filtered = markets.filter((market) => market.name.match(/app/i));
      cy.getByTestId('market-pane')
        .children()
        .find('[role="button"]')
        .should('have.length', filtered.length);
      cy.getByTestId('market-pane')
        .children()
        .find('[role="button"]')
        .last()
        .click();
      cy.location('pathname').should(
        'eq',
        `/trading/${filtered[filtered.length - 1].id}`
      );
      cy.get('input[placeholder="Search"]').should(
        'have.value',
        filtered[filtered.length - 1].name
      );
    }
  });

  it('mobile view', () => {
    if (markets?.length) {
      cy.viewport('iphone-xr');
      cy.visit(`/trading/${markets[0].id}`);
      cy.get('[role="dialog"]').should('not.exist');
      cy.getByTestId('arrow-button').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.get('input[placeholder="Search"]').clear();
      cy.getByTestId('market-pane')
        .children()
        .find('[role="button"]')
        .should('have.length', markets.length);
      cy.getByTestId('dialog-close').click();
      cy.get('input[placeholder="Search"]').should(
        'have.value',
        markets[0].name
      );
    }
  });
});
