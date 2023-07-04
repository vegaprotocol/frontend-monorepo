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

// skipped due to existing issue
// https://github.com/vegaprotocol/frontend-monorepo/issues/2243
context.skip('Parties page', { tags: '@regression' }, function () {
  before('send-faucet assets to connected vega wallet', function () {
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
      cy.get_connected_parties_accounts().as('party_accounts');

      // Ensure balance of each party asset is correct
      cy.get('@party_accounts').then((accounts) => {
        assetsInTest.forEach((asset) => {
          cy.get_asset_decimals(assetData[asset].id).then((assetDecimals) => {
            assert.equal(
              accounts[assetData[asset].id].balance,
              assetData[asset].amount + assetDecimals,
              `Checking ${assetData[asset].id} faucet was successfull`
            );
          });
        });
      });
    });

    it('should see party address id - having searched', function () {
      cy.getByTestId('parties-header')
        .siblings()
        .contains(vegaWalletPublicKey.substring(0, 14))
        .should('be.visible');
    });

    it('should see each asset and balance - within asset data section', function () {
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

    it(
      'should be able to copy the party address id',
      { browser: 'chrome' },
      function () {
        cy.monitor_clipboard().as('clipboard');
        cy.getByTestId('parties-header')
          .next()
          .within(() => {
            cy.get('button').click();
          });
        cy.get('@clipboard')
          .get_copied_text_from_clipboard()
          .should('equal', vegaWalletPublicKey);
      }
    );

    it(
      'should be able to copy an asset id',
      { browser: 'chrome' },
      function () {
        cy.monitor_clipboard().as('clipboard');

        cy.contains(assetData.fDAI.name, txTimeout).should('be.visible');
        cy.contains(assetData.fDAI.name)
          .parent()
          .parent()
          .siblings()
          .within(() => {
            cy.get('[data-state="closed"]').last().click({ force: true });
          });

        cy.get('@clipboard')
          .get_copied_text_from_clipboard()
          .should('equal', assetData.fDAI.id);
      }
    );

    it('should be able to see JSON of each asset containing correct balance and decimals', function () {
      cy.get(partiesJsonSection).should('be.visible');

      assetsInTest.forEach((assetInTest) => {
        cy.get(partiesJsonSection)
          .invoke('text')
          .convert_string_json_to_js_object()
          .get_party_accounts_data_from_js_object()
          .then((accountsListedInJson) => {
            cy.getAssets().then((assetsInfo) => {
              const assetInfo =
                assetsInfo[accountsListedInJson[assetInTest].asset.name];

              assert.equal(
                accountsListedInJson[assetInTest].asset.name,
                assetInfo.name
              );
              assert.equal(
                accountsListedInJson[assetInTest].asset.id,
                assetInfo.id
              );
              assert.equal(
                accountsListedInJson[assetInTest].asset.decimals,
                assetInfo.decimals
              );
              assert.equal(
                accountsListedInJson[assetInTest].asset.symbol,
                assetInfo.symbol
              );
              assert.equal(
                accountsListedInJson[assetInTest].asset.source.__typename,
                assetInfo.source.__typename
              );
              cy.get_asset_decimals(assetInTest).then((assetDecimals) => {
                assert.equal(
                  accountsListedInJson[assetInTest].balance,
                  assetData[assetInTest].amount + assetDecimals
                );
              });
            });
          });
      });
    });

    it('should be able to switch parties page between light and dark mode', function () {
      const whiteThemeSelectedMenuOptionColor = 'rgb(255, 7, 127)';
      const whiteThemeJsonFieldBackColor = 'rgb(255, 255, 255)';
      const whiteThemeSideMenuBackgroundColor = 'rgb(255, 255, 255)';
      const darkThemeSelectedMenuOptionColor = 'rgb(215, 251, 80)';
      const darkThemeJsonFieldBackColor = 'rgb(38, 38, 38)';
      const darkThemeSideMenuBackgroundColor = 'rgb(0, 0, 0)';
      const themeSwitcher = '[data-testid="theme-switcher"]';
      const jsonFields = '.hljs';
      const sideMenuBackground = '.absolute';

      // Engage dark mode if not allready set
      /**
       * TODO(@nx/cypress): Nesting Cypress commands in a should assertion now throws.
       * You should use .then() to chain commands instead.
       * More Info: https://docs.cypress.io/guides/references/migration-guide#-should
       **/
      cy.get(sideMenuBackground)
        .should('have.css', 'background-color')
        .then((background_color) => {
          if (background_color.includes(whiteThemeSideMenuBackgroundColor))
            cy.get(themeSwitcher).click();
        });

      // Engage white mode
      cy.get(themeSwitcher).click();

      // White Mode
      cy.get(partiesMenuHeader)
        .should('have.css', 'background-color')
        .and('include', whiteThemeSelectedMenuOptionColor);
      cy.get(jsonFields)
        .should('have.css', 'background-color')
        .and('include', whiteThemeJsonFieldBackColor);
      cy.get(sideMenuBackground)
        .should('have.css', 'background-color')
        .and('include', whiteThemeSideMenuBackgroundColor);

      // Dark Mode
      cy.get(themeSwitcher).click();
      cy.get(partiesMenuHeader)
        .should('have.css', 'background-color')
        .and('include', darkThemeSelectedMenuOptionColor);
      cy.get(jsonFields)
        .should('have.css', 'background-color')
        .and('include', darkThemeJsonFieldBackColor);
      cy.get(sideMenuBackground)
        .should('have.css', 'background-color')
        .and('include', darkThemeSideMenuBackgroundColor);
    });

    Cypress.Commands.add('get_asset_decimals', (assetID) => {
      cy.getAssets().then((assetsInfo) => {
        const assetDecimals = assetsInfo[assetData[assetID].name].decimals;
        let decimals = '';
        for (let i = 0; i < assetDecimals; i++) decimals += '0';
        return decimals;
      });
    });

    Cypress.Commands.add('get_connected_parties_accounts', () => {
      const mutation =
        '{partiesConnection {edges{node{accountsConnection{edges{node{\
          balance type asset {id symbol decimals}}}}}}}}';
      cy.request({
        method: 'POST',
        url: `http://localhost:3008/graphql`,
        body: {
          query: mutation,
        },
        headers: { 'content-type': 'application/json' },
      })
        .its(
          `body.data.partiesConnection.edges.1.node.accountsConnection.edges`
        )
        .then(function (response) {
          let accounts = {};
          response.forEach((account) => {
            accounts[account.node.asset.id] = account.node;
          });
          return accounts;
        });
    });

    Cypress.Commands.add(
      'get_party_accounts_data_from_js_object',
      { prevSubject: true },
      (jsObject) => {
        const accounts = jsObject.party.accounts.reduce(function (
          account,
          entry
        ) {
          account[entry.asset.id] = entry;
          return account;
        },
        {});
        return accounts;
      }
    );
  });
});
