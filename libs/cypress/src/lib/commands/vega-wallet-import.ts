declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      vega_wallet_import(): void;
    }
  }
}

export function addVegaWalletImport() {
  // @ts-ignore - ignoring Cypress type error which gets resolved when Cypress uses the command
  Cypress.Commands.add('vega_wallet_import', () => {
    const walletName = Cypress.env('vegaWalletName');
    const walletLocation = Cypress.env('vegaWalletLocation');

    cy.highlight(`Importing Vega Wallet ${walletName}`);
    cy.exec(`vega wallet init -f --home ${walletLocation}`);
    cy.exec(
      `vega wallet import -w ${walletName} --recovery-phrase-file ./src/fixtures/wallet/recovery -p ./src/fixtures/wallet/passphrase --home ${walletLocation}`,
      { failOnNonZeroExit: false }
    );
    cy.exec(
      `vega wallet key generate -w ${walletName} -p ./src/fixtures/wallet/passphrase --home ${walletLocation}`
    );
    cy.exec(
      `vega wallet service run --network DV --automatic-consent  --home ${walletLocation}`
    );
  });
}
