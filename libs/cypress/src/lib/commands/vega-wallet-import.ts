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
        cy.highlight(`Importing Vega Wallet ${Cypress.env('vegaWalletName')}`);
        cy.exec(`vega wallet init -f --home ${Cypress.env('vegaWalletLocation')}`);
        cy.exec(
          `vega wallet import -w ${Cypress.env('vegaWalletName')} --recovery-phrase-file ./src/fixtures/wallet/recovery -p ./src/fixtures/wallet/passphrase --home ${Cypress.env('vegaWalletLocation')}`,
          { failOnNonZeroExit: false }
        );
        cy.exec(
          `vega wallet service run --network DV --automatic-consent  --home ${Cypress.env('vegaWalletLocation')}`
        );
      });
  }
  