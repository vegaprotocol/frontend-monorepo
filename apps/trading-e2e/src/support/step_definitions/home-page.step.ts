import { Then, When } from 'cypress-cucumber-preprocessor/steps';
import VegaWallet from '../vega-wallet';
import HomePage from '../pages/home-page';

const vegaWallet = new VegaWallet();
const homePage = new HomePage();

export interface OpenMarketType {
  marketTimestamps: {
    open: string;
  };
  tradableInstrument: {
    instrument: {
      code: string;
      name: string;
    };
  };
}

When('I query the server for Open Markets', function () {
  homePage.getOpenMarketsFromServer().then((openMarkets: OpenMarketType[]) => {
    cy.wrap(openMarkets).as('openMarketData');
  });
});

Then('I am prompted to select a market', () => {
  cy.contains('Select a market to get started', { timeout: 20000 }).should(
    'be.visible'
  );
});

Then('the choose market overlay is no longer showing', () => {
  cy.contains('Select a market to get started').should('not.exist');
  cy.contains('Loading...', { timeout: 20000 }).should('not.exist');
});

Then(
  'the server contains at least {int} open markets',
  function (expectNumber: number) {
    cy.get('@openMarketData').its('length').should('be.at.least', expectNumber);
  }
);

Then(
  'I expect the market overlay table to contain at least {int} rows',
  function (expectNumber: number) {
    cy.get('table tr').then((row) => {
      expect(row.length).to.be.at.least(expectNumber);
    });
  }
);

Then(
  'each market shown in overlay table exists as open market on server',
  function () {
    const arrayOfOpenMarketCodes: string[] = [];
    cy.get('@openMarketData')
      .each((openMarket: OpenMarketType) => {
        arrayOfOpenMarketCodes.push(
          openMarket.tradableInstrument.instrument.code
        );
      })
      .then(() => {
        homePage.validateTableCodesExistOnServer(arrayOfOpenMarketCodes);
      });
  }
);

Then(
  'each market shown in overlay table contains content under the last price and change fields',
  function () {
    homePage.validateTableContainsLastPriceAndChange();
  }
);

Then(
  'each market shown in the full list exists as open market on server',
  function () {
    cy.get('@openMarketData').each((openMarket: OpenMarketType) => {
      cy.contains(openMarket.tradableInstrument.instrument.code).should(
        'be.visible'
      );
    });
  }
);

Then(
  'the oldest market trading in continous mode shown at top of overlay table',
  () => {
    let currentOldestTime = 9999999999999;
    let oldestMarketInstrumentCode: string;

    cy.get('@openMarketData')
      .each((openMarket: OpenMarketType) => {
        const marketTime = Date.parse(openMarket.marketTimestamps.open);
        if (marketTime < currentOldestTime) {
          currentOldestTime = marketTime;
          oldestMarketInstrumentCode =
            openMarket.tradableInstrument.instrument.code;
        }
      })
      .then(() => {
        homePage.validateStringIsDisplayedAtTopOfTable(
          oldestMarketInstrumentCode
        );
      });
  }
);

Then(
  'the oldest market trading in continous mode shown at top of overlay table alternative',
  () => {
    cy.get('@openMarketData')
      .then((openMarkets: OpenMarketType[]) => {
        homePage.getOldestOpenMarket(openMarkets);
      })
      .then((oldestOpenMarket: OpenMarketType) => {
        homePage.validateStringIsDisplayedAtTopOfTable(
          oldestOpenMarket.tradableInstrument.instrument.code
        );
      });
  }
);

Then(
  'the oldest current trading market is loaded on the trading tab',
  function () {
    let currentOldestTime = 9999999999999;
    let oldestMarketInstrumentName: string;

    cy.get('@openMarketData')
      .each((openMarket: OpenMarketType) => {
        const marketTime = Date.parse(openMarket.marketTimestamps.open);
        if (marketTime < currentOldestTime) {
          currentOldestTime = marketTime;
          oldestMarketInstrumentName =
            openMarket.tradableInstrument.instrument.name;
        }
      })
      .then(() => {
        cy.getByTestId('market', { timeout: 12000 }).within(() => {
          cy.get('button')
            .contains(oldestMarketInstrumentName)
            .should('be.visible');
        });
      });
  }
);

Then(
  'the most recent current trading market is loaded on the trading tab',
  function () {
    let currentNewTime = 0;
    let mostRecentMarketInstrumentName: string;
    cy.get('@openMarketData')
      .each((openMarket: OpenMarketType) => {
        const marketTime = Date.parse(openMarket.marketTimestamps.open);
        if (marketTime > currentNewTime) {
          currentNewTime = marketTime;
          mostRecentMarketInstrumentName =
            openMarket.tradableInstrument.instrument.name;
        }
      })
      .then(() => {
        cy.getByTestId('market', { timeout: 12000 }).within(() => {
          cy.get('button')
            .contains(mostRecentMarketInstrumentName)
            .should('be.visible');
        });
      });
  }
);

When('I click the most recent trading market', function () {
  let currentNewTime = 0;
  let mostRecentMarketInstrumentCode: string;
  cy.get('@openMarketData')
    .each((openMarket: OpenMarketType) => {
      const marketTime = Date.parse(openMarket.marketTimestamps.open);
      if (marketTime > currentNewTime) {
        currentNewTime = marketTime;
        mostRecentMarketInstrumentCode =
          openMarket.tradableInstrument.instrument.code;
      }
    })
    .then(() => {
      cy.contains(mostRecentMarketInstrumentCode).click();
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
