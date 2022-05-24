import BasePage from './base-page';
export default class HomePage extends BasePage {
  statsEnvironmentTitle = 'stats-environment';
  statsTitle = 'stats-title';
  statsValue = 'stats-value';

  verifyStatsEnvironment() {
    const deployedEnv = Cypress.env('environment').toUpperCase();
    cy.getByTestId(this.statsEnvironmentTitle).should(
      'have.text',
      `/ ${deployedEnv}`
    );
  }

  verifyStatsTitlesDisplayed() {
    const statTitles = [
      'Status',
      'Height',
      'Validating nodes',
      'Uptime',
      'Total nodes',
      'Inactive nodes',
      'Total staked',
      'Backlog',
      'Trades / second',
      'Orders / block',
      'Orders / second',
      'Transactions / block',
      'Block time',
      'Time',
      'App',
      'Tendermint',
      'Up since',
      'Chain ID',
    ];

    cy.getByTestId(this.statsTitle).then(($list) => {
      cy.wrap($list).should('have.length', 18);
    });

    cy.getByTestId(this.statsTitle)
      .each(($title, index) => {
        cy.wrap($title).should('have.text', statTitles[index]);
      })
      .then(($list) => {
        cy.wrap($list).should('have.length', 18);
      });
  }

  verifyStatsValuesDisplayed() {
    cy.getByTestId(this.statsValue).eq(0).should('have.text', 'CONNECTED');
    cy.getByTestId(this.statsValue).eq(1).should('not.be.empty');
    cy.getByTestId(this.statsValue).eq(2).should('have.text', '2');
    cy.getByTestId(this.statsValue)
      .eq(3)
      .invoke('text')
      .should('match', /\d+d \d+h \d+m \d+s/i);
    cy.getByTestId(this.statsValue).eq(4).should('have.text', '2');
    cy.getByTestId(this.statsValue).eq(5).should('have.text', '0');
    cy.getByTestId(this.statsValue).eq(6).should('have.text', '0.00');
    cy.getByTestId(this.statsValue).eq(7).should('have.text', '0');
    cy.getByTestId(this.statsValue).eq(8).should('have.text', '0');
    cy.getByTestId(this.statsValue).eq(9).should('have.text', '0');
    cy.getByTestId(this.statsValue).eq(10).should('have.text', '0');
    cy.getByTestId(this.statsValue).eq(11).should('not.be.empty');
    cy.getByTestId(this.statsValue).eq(12).should('not.be.empty');
    cy.getByTestId(this.statsValue).eq(13).should('not.be.empty');
    cy.getByTestId(this.statsValue)
      .eq(14)
      .invoke('text')
      .should('match', /v\d+\.\d+\.\d+/i);
    cy.getByTestId(this.statsValue)
      .eq(15)
      .invoke('text')
      .should('match', /\d+\.\d+\.\d+/i);
    cy.getByTestId(this.statsValue).eq(16).should('not.be.empty');
    cy.getByTestId(this.statsValue).eq(17).should('not.be.empty');
  }

  verifyStatsBlockHeightUpdating() {
    cy.getByTestId(this.statsValue)
      .eq(1)
      .invoke('text')
      .then((blockHeightTxt) => {
        cy.getByTestId(this.statsValue)
          .eq(1)
          .invoke('text')
          .should((newBlockHeightTxt) => {
            expect(blockHeightTxt).not.to.eq(newBlockHeightTxt);
          });
      });
  }
}
