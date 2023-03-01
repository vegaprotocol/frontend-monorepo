declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      vega_wallet_receive_fauceted_asset(
        assetName: string,
        amount: string,
        vegaWalletPublicKey: string
      ): void;
    }
  }
}

export function addVegaWalletReceiveFaucetedAsset() {
  // @ts-ignore - ignoring Cypress type error which gets resolved when Cypress uses the command
  Cypress.Commands.add(
    'vega_wallet_receive_fauceted_asset',
    function (assetName, amount, vegaWalletPublicKey) {
      cy.highlight(
        `Topping up vega wallet with ${assetName}, amount: ${amount}`
      );
      // @ts-ignore - ignoring Cypress type error which gets resolved when Cypress uses the command
      cy.getAssets().then((assets) => {
        const asset = assets[assetName];
        if (assets[assetName] !== undefined) {
          for (let i = 0; i < asset.decimals; i++) amount += '0';
          cy.exec(
            `curl -X POST -d '{"amount": "${amount}", "asset": "${asset.id}", "party": "${vegaWalletPublicKey}"}' http://localhost:1790/api/v1/mint`
          )
            .its('stdout')
            .then((response) => {
              assert.include(
                response,
                `"success":true`,
                'Ensuring curl command was successfully undertaken'
              );
            });
        } else {
          const validAssets = assets.filter((a) => a.name.includes('fake'));
          assert.exists(
            asset,
            `${assetName} is not a faucet-able asset, only the following assets can be faucet-ed: ${validAssets}`
          );
        }
      });
    }
  );
}
