declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      importNodeWallets(): void;
    }
  }
}

export const addImportNodeWallets = () => {
  Cypress.Commands.add('importNodeWallets', () => {
    // Import node wallets using recovery files generated from cy.getNodeWalletsRecoveryPhrase()
    //cy.exec('vega wallet import -w node0_wallet --recovery-phrase-file ./src/fixtures/wallet/node0RecoveryPhrase -p ./src/fixtures/wallet/passphrase --home ~/.vegacapsule/testnet/wallet')
    cy.exec(
      'vega wallet import -w node1_wallet --recovery-phrase-file ./src/fixtures/wallet/node1RecoveryPhrase -p ./src/fixtures/wallet/passphrase --home ~/.vegacapsule/testnet/wallet'
    );

    // Initialise api token
    //cy.exec('vega wallet api-token init --home ~/.vegacapsule/testnet/wallet --passphrase-file ./src/fixtures/wallet/passphrase')

    // Generate api tokens for wallets
    cy.exec(
      'vega wallet api-token generate --wallet-name node0_wallet --tokens-passphrase-file ./src/fixtures/wallet/passphrase  --wallet-passphrase-file ./src/fixtures/wallet/passphrase --home ~/.vegacapsule/testnet/wallet'
    )
      .its('stdout')
      .then((result) => {
        const apiToken = result.match('[a-zA-Z0-9]{64}');
        if (apiToken) {
          cy.wrap(apiToken[0]).as('node0ApiToken');
        }
      });

    cy.exec(
      'vega wallet api-token generate --wallet-name node1_wallet --tokens-passphrase-file ./src/fixtures/wallet/passphrase  --wallet-passphrase-file ./src/fixtures/wallet/passphrase --home ~/.vegacapsule/testnet/wallet'
    )
      .its('stdout')
      .then((result) => {
        const apiToken = result.match('[a-zA-Z0-9]{64}');
        if (apiToken) {
          cy.wrap(apiToken[0]).as('node1ApiToken');
        }
      });
  });
};
