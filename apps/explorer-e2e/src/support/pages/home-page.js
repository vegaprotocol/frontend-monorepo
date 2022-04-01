import BasePage from './base-page';
export default class HomePage extends BasePage {
  statsEnvironmentTitle = 'stats-environment';
  statsTitle = 'stats-title';
  statsValue = 'stats-value';

  verifyStatsEnvironment(expectedEnv) {
    cy.getByTestId(this.statsEnvironmentTitle).should('have.text', expectedEnv);
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
      .each(($value) => {
        cy.wrap($value).should('not.be.empty');
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
        cy.wait(1000); // eslint-disable-line cypress/no-unnecessary-waiting
        //Wait needed to allow blocks to change
        cy.getByTestId(this.statsValue)
          .eq(1)
          .invoke('text')
          .should((newBlockHeightTxt) => {
            expect(blockHeightTxt).not.to.eq(newBlockHeightTxt);
          });
      });
  }
}
