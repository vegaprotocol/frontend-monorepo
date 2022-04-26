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

    cy.getByTestId(this.statsTitle)
      .each(($title, index) => {
        cy.wrap($title).should('have.text', statTitles[index]);
      })
      .then(($list) => {
        cy.wrap($list).should('have.length', 18);
      });
  }

  verifyStatsValuesdisplayed() {
    cy.getByTestId(this.statsValue)
      .each(($value, index) => {
        cy.wrap($value).should('not.be.empty');
        if (index == 6) {
          // Total staked value
          const totalStakedRegex = /^[0-9]+(\.[0-9]{0,2})?$/;
          cy.wrap($value).invoke('text').should('match', totalStakedRegex); // Check that value is number with 2dp
        }
      })
      .then(($list) => {
        cy.wrap($list).should('have.length', 18);
      });
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
