import { Then, When } from 'cypress-cucumber-preprocessor/steps';
import VegaWallet from '../vega-wallet';
import HomePage from '../pages/home-page';

const vegaWallet = new VegaWallet();
const homePage = new HomePage();

When('I query the server for Open Markets', function () {
  homePage.getOpenMarketsFromServer().then((openMarkets) => {
    this.openMarketData = openMarkets;
  });
});

Then('I am prompted to select a market', () => {
  cy.contains('Select a market to get started').should('be.visible');
});

Then('the choose market overlay is no longer showing', () => {
  cy.contains('Select a market to get started').should('not.exist');
  cy.contains('Loading...', { timeout: 20000 }).should('not.exist');
});

Then(
  'the server contains at least {int} open markets',
  function (expectNumber) {
    expect(this.openMarketData.length).to.be.at.least(expectNumber);
  }
);

Then(
  'I expect the market overlay table to contain at least {int} rows',
  function (expectNumber) {
    cy.get('table tr').then((row) => {
      expect(row.length).to.be.at.least(expectNumber);
    });
  }
);

Then(
  'each market shown in overlay table exists as open market on server',
  function () {
    homePage.getOpenMarketCodes(this.openMarketData).then((openMarketCodes) => {
      homePage.validateTableCodesExistOnServer(openMarketCodes);
    });
  }
);

Then(
  'each market shown in overlay table contains content under the last price and change fields',
  function () {
    homePage.getOpenMarketCodes(this.openMarketData).then((openMarketCodes) => {
      homePage.validateTableContainsLastPriceAndChange(openMarketCodes);
    });
  }
);

Then(
  'each market shown in the full list exists as open market on server',
  function () {
    homePage.getOpenMarketCodes(this.openMarketData).each((openMarketCode) => {
      cy.contains(openMarketCode).should('be.visible');
    });
  }
);

Then(
  'the oldest market trading in continous mode shown at top of overlay table',
  function () {
    homePage
      .getOldestTradableInstrument(this.openMarketData)
      .then((oldestTradableInstrument) => {
        homePage.validateStringIsDisplayedAtTopOfTable(
          oldestTradableInstrument.instrument.code
        );
      });
  }
);

Then(
  'the oldest current trading market is loaded on the trading tab',
  function () {
    homePage
      .getOldestTradableInstrument(this.openMarketData)
      .then((oldestTradableInstrument) => {
        cy.getByTestId('market').within(() => {
          cy.get('button')
            .contains(oldestTradableInstrument.instrument.name)
            .should('be.visible');
        });
      });
  }
);

Then(
  'the most recent current trading market is loaded on the trading tab',
  function () {
    homePage
      .getMostRecentTradableInstrument(this.openMarketData)
      .then((mostRecentMarketInstrument) => {
        cy.getByTestId('market').within(() => {
          cy.get('button')
            .contains(mostRecentMarketInstrument.instrument.name)
            .should('be.visible');
        });
      });
  }
);

When('I click the most recent trading market', function () {
  homePage
    .getMostRecentTradableInstrument(this.openMarketData)
    .then((mostRecentMarketInstrument) => {
      cy.contains(mostRecentMarketInstrument.instrument.code).click();
    });
});

When('I click the view full market list', () => {
  cy.contains('Or view full market list').click();
  cy.contains('Loading...').should('be.visible');
  cy.contains('Loading...').should('not.exist');
});

When('I try to connect Vega wallet with incorrect details', () => {
  vegaWallet.openVegaWalletConnectDialog();
  vegaWallet.fillInWalletForm('name', 'wrong passphrase');
  vegaWallet.clickConnectVegaWallet();
});

When('I try to connect Vega wallet with blank fields', () => {
  vegaWallet.openVegaWalletConnectDialog();
  vegaWallet.clickConnectVegaWallet();
});

Then('wallet not running error message is displayed', () => {
  vegaWallet.validateWalletNotRunningError();
});

Then('wallet field validation errors are shown', () => {
  vegaWallet.validateWalletErrorFieldsDisplayed();
});
