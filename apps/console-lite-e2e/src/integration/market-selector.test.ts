const marketId = 'market-0';
const marketName = 'ACTIVE MARKET';

describe('market selector', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.mockConsole();
    cy.setVegaWallet();
    cy.visit(`/trading/${marketId}`);
    cy.wait('@Markets');
  });

  it('should be properly rendered', () => {
    cy.get('input[placeholder="Search"]').should('have.value', marketName);
    cy.getByTestId('arrow-button').click();
    cy.getByTestId('market-pane').should('be.visible');
    cy.getByTestId('market-pane')
      .children()
      .find('[role="button"]')
      .first()
      .should('contain.text', marketName);
    cy.getByTestId('market-pane')
      .children()
      .find('[role="button"]')
      .first()
      .click();
    cy.getByTestId('market-pane').should('not.be.visible');
  });

  it('typing should change list', () => {
    cy.get('input[placeholder="Search"]').type('{backspace}');
    cy.getByTestId('market-pane')
      .children()
      .find('[role="button"]')
      .should('have.length.at.least', 1);
    cy.get('input[placeholder="Search"]').clear();
    cy.get('input[placeholder="Search"]').type('ACTIVE');
    cy.getByTestId('market-pane')
      .children()
      .find('[role="button"]')
      .should('have.length', 1);
    cy.getByTestId('market-pane')
      .children()
      .find('[role="button"]')
      .last()
      .click();
    cy.location('pathname').should('eq', `/trading/${marketId}`);
    cy.get('input[placeholder="Search"]').should('have.value', marketName);
  });
  // constantly failing on ci
  it.skip('keyboard navigation should work well', () => {
    cy.get('input[placeholder="Search"]').type('{backspace}');
    cy.get('input[placeholder="Search"]').clear();
    cy.focused().realPress('ArrowDown');
    cy.focused().should('contain.text', marketName);
    cy.focused().realPress('ArrowDown');
    cy.focused().should('contain.text', 'ETHBTC').realPress('Enter');
    cy.location('pathname').should('eq', '/trading/ethbtc-quaterly');

    cy.get('input[placeholder="Search"]').type('{backspace}');
    cy.get('input[placeholder="Search"]').clear();
    cy.getByTestId('market-pane').should('be.visible');
    cy.get('body').realPress('ArrowDown');
    cy.get('body').realPress('Tab');
    cy.getByTestId('market-pane').should('not.be.visible');
  });

  it('mobile view', () => {
    cy.viewport('iphone-xr');
    cy.visit(`/trading/${marketId}`);
    cy.connectVegaWallet();
    cy.get('[role="dialog"]').should('not.exist');
    cy.getByTestId('arrow-button').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('input[placeholder="Search"]').then((search) => {
      cy.wrap(search).clear();
    });
    cy.getByTestId('market-pane')
      .children()
      .find('[role="button"]')
      .should('have.length', 3);
    cy.get('div[role="dialog"]').should('have.class', 'w-screen');
    cy.getByTestId('dialog-close').click();
    cy.get('input[placeholder="Search"]').should('have.value', marketName);
  });
});
