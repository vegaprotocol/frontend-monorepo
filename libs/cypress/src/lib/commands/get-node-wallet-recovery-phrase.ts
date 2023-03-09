declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      getNodeWalletsRecoveryPhrase(): void;
    }
  }
}

export const addGetNodeWalletsRecoveryPhrase = () => {
  Cypress.Commands.add('getNodeWalletsRecoveryPhrase', () => {
    cy.exec('vegacapsule nodes ls --home-path ~/.vegacapsule/testnet/')
      .its('stdout')
      .then((result) => {
        const obj = JSON.parse(result);
        console.log(obj);
        cy.writeFile(
          './src/fixtures/wallet/node0RecoveryPhrase',
          obj['testnet-nodeset-validators-0-validator'].Vega.NodeWalletInfo
            .VegaWalletRecoveryPhrase
        );
        cy.writeFile(
          './src/fixtures/wallet/node1RecoveryPhrase',
          obj['testnet-nodeset-validators-1-validator'].Vega.NodeWalletInfo
            .VegaWalletRecoveryPhrase
        );
      });
  });
};
