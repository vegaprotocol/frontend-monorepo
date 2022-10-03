const vegaWalletPublicKey = Cypress.env('vegaWalletPublicKey');
const partiesMenuHeader = 'a[href="/parties"]';
const partiesSearchBox = '[data-testid="party-input"]';
const partiesSearchAction = '[data-testid="go-submit"]';
const partiesJsonSection = '[data-testid="parties-json"]';
const txTimeout = Cypress.env('txTimeout');

let assetData = {
  fUSDC: { id: 'fUSDC', name: 'USDC (fake)', amount: '10' },
  fBTC: { id: 'fBTC', name: 'BTC (fake)', amount: '6' },
  fEURO: { id: 'fEURO', name: 'EURO (fake)', amount: '8' },
  fDAI: { id: 'fDAI', name: 'DAI (fake)', amount: '2' },
};

const assetsInTest = Object.keys(assetData);

context('Parties page', { tags: '@regression' }, function () {
  before('send-faucet assets to connected vega wallet', function () {
    cy.vega_wallet_import();
    assetsInTest.forEach((asset) => {
      cy.vega_wallet_receive_fauceted_asset(
        assetData[asset].name,
        assetData[asset].amount,
        vegaWalletPublicKey
      );
    });
    cy.visit('/');
  });

  describe('Verify parties page content', function () {
    before('navigate to parties page and search for party', function () {
      cy.get(partiesMenuHeader).click();
      // Deliberate slow entry of party id/key - enabling transactions to sync
      cy.get(partiesSearchBox).type(vegaWalletPublicKey, { delay: 120 });
      cy.get(partiesSearchAction).click();
    });

    it('should see party address id - having searched', function () {
      cy.contains('Address')
        .siblings()
        .contains(vegaWalletPublicKey)
        .should('be.visible');
    });

    it('should see each asset - within asset data section', function () {
      assetsInTest.forEach((asset) => {
        cy.contains(assetData[asset].name, txTimeout).should('be.visible');
        cy.contains(assetData[asset].name)
          .siblings()
          .contains(assetData[asset].id)
          .should('be.visible');
        cy.contains(assetData[asset].name, txTimeout)
          .parent()
          .siblings()
          .within(() => {
            cy.get_asset_decimals(asset).then((assetDecimals) => {
              cy.contains_exactly(
                assetData[asset].amount + '.' + assetDecimals
              ).should('be.visible');
            });
          });
      });
    });

    it('should be able to copy the party address id', function () {
      cy.monitor_clipboard().as('clipboard');
      cy.contains('Address').siblings().last().click();
      cy.get('@clipboard')
        .get_copied_text_from_clipboard()
        .should('equal', vegaWalletPublicKey);
    });

    it('should be able to copy an asset id', function () {
      cy.monitor_clipboard().as('clipboard');

      cy.contains(assetData.fDAI.name, txTimeout).should('be.visible');
      cy.contains(assetData.fDAI.name)
        .siblings()
        .within(() => {
          cy.get('[data-state="closed"]').last().click({ force: true });
        });

      cy.get('@clipboard')
        .get_copied_text_from_clipboard()
        .should('equal', assetData.fDAI.id);
    });

    it('should be able to see JSON of each asset containing correct balance and decimals', function () {
      cy.get(partiesJsonSection).should('be.visible');

      assetsInTest.forEach((asset) => {
        cy.get(partiesJsonSection)
          .invoke('text')
          .convert_string_json_to_js_object()
          .get_party_accounts_data()
          .then((accounts) => {
            cy.get_asset_decimals(asset).then((assetDecimals) => {
              assert.equal(
                accounts[asset].balance,
                assetData[asset].amount + assetDecimals
              );
            });
          });
      });
    });

    after(
      'teardown environment to prevent test data bleeding into other tests',
      function () {
        if (Cypress.env('CYPRESS_TEARDOWN_NETWORK_AFTER_FLOWS')) {
          cy.restart_vegacapsule_network();
        }
      }
    );

    Cypress.Commands.add('get_asset_decimals', (assetID) => {
      cy.get_asset_information().then((assetsInfo) => {
        const assetDecimals = assetsInfo[assetData[assetID].name].decimals;
        let decimals = '';
        for (let i = 0; i < assetDecimals; i++) decimals += '0';
        return decimals;
      });
    });

    Cypress.Commands.add(
      'convert_string_json_to_js_object',
      { prevSubject: true },
      (jsonBlobString) => {
        return JSON.parse(jsonBlobString);
      }
    );

    Cypress.Commands.add(
      'get_party_accounts_data',
      { prevSubject: true },
      (jsObject) => {
        const accounts = jsObject.party.accounts.reduce(function (
          account,
          entry
        ) {
          account[entry.asset.id] = {
            balance: entry.balance,
            id: entry.asset.id,
            decimals: entry.asset.decimals,
            name: entry.asset.name,
          };
          return account;
        },
        {});
        return accounts;
      }
    );
  });
});
