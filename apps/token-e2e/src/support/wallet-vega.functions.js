const vegaWalletContainer = '[data-testid="vega-wallet"]';
const restConnectorForm = '[data-testid="rest-connector-form"]';
const vegaWalletNameElement = '[data-testid="wallet-name"]';
const vegaWalletName = Cypress.env('vegaWalletName');
const vegaWalletPublicKey = Cypress.env('vegaWalletPublicKey');
const vegaWalletLocation = Cypress.env('vegaWalletLocation');
const vegaWalletPassphrase = Cypress.env('vegaWalletPassphrase');

Cypress.Commands.add('vega_wallet_import', () => {
  cy.highlight(`Importing Vega Wallet ${vegaWalletName}`);
  cy.exec(`vega wallet init -f --home ${vegaWalletLocation}`);
  cy.exec(
    `vega wallet import -w ${vegaWalletName} --recovery-phrase-file ./src/fixtures/wallet/recovery -p ./src/fixtures/wallet/passphrase --home ~/.vegacapsule/testnet/wallet`,
    { failOnNonZeroExit: false }
  );
  cy.exec(
    `vega wallet service run --network DV --automatic-consent  --home ${vegaWalletLocation}`
  );
});

Cypress.Commands.add('vega_wallet_connect', () => {
  cy.highlight('Connecting Vega Wallet');
  cy.get(vegaWalletContainer).within(() => {
    cy.get('button')
      .contains('Connect Vega wallet to use associated $VEGA')
      .should('be.enabled')
      .and('be.visible')
      .click({ force: true });
  });
  cy.contains('rest provider').click();
  cy.get(restConnectorForm).within(() => {
    cy.get('#wallet').click().type(vegaWalletName);
    cy.get('#passphrase').click().type(vegaWalletPassphrase);
    cy.get('button').contains('Connect').click();
  });
  cy.get(vegaWalletNameElement).should('be.visible');
});

Cypress.Commands.add(
  'vega_wallet_receive_asset',
  function (assetName, amount) {
    cy.highlight(`Topping up vega wallet with ${assetName}, amount: ${amount}`);
    cy.get_asset_information().then((assets) => {
      let asset = assets[assetName];
      for (let i = 0; i < asset.decimals; i++) amount += '0';
      cy.exec(
        `curl -X POST -d '{"amount": "${amount}", "asset": "${asset.id}", "party": "${vegaWalletPublicKey}"}' -u "hedgehogandvega:hiccup" http://localhost:1790/api/v1/mint`
      );
    });
  }
);

Cypress.Commands.add('get_asset_information', () => {
  let mutation =
    '{ assets {name id decimals globalRewardPoolAccount {balance}}}';
  cy.request({
    method: 'POST',
    url: `http://localhost:3028/query`,
    body: {
      query: mutation,
    },
    headers: { 'content-type': 'application/json' },
  })
    .its(`body.data.assets`)
    .then(function (response) {
      let object = response.reduce(function (assets, entry) {
        assets[entry.name] = {
          id: entry.id,
          decimals: entry.decimals,
        };
        return assets;
      }, {});

      return object;
    });
});