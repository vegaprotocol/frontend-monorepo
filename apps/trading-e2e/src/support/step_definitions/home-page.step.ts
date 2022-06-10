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
  (expectedNumber: number) => {
    cy.get('@openMarketData')
      .its('length')
      .should('be.at.least', expectedNumber);
  }
);

Then(
  'I expect the market overlay table to contain at least {int} rows',
  (expectedNumber: number) => {
    cy.get('table tr').then((row) => {
      expect(row.length).to.be.at.least(expectedNumber);
    });
  }
);

Then(
  'each market shown in overlay table exists as open market on server',
  () => {
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
  () => {
    homePage.validateTableContainsLastPriceAndChange();
  }
);

Then(
  'each market shown in the full list exists as open market on server',
  () => {
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
    cy.get<OpenMarketType[]>('@openMarketData').then(
      (openMarkets: OpenMarketType[]) => {
        const oldestMarket = homePage.getOldestOpenMarket(openMarkets);
        homePage.validateStringIsDisplayedAtTopOfTable(
          oldestMarket.tradableInstrument.instrument.code
        );
      }
    );
  }
);

Then('the oldest current trading market is loaded on the trading tab', () => {
  cy.get<OpenMarketType[]>('@openMarketData').then(
    (openMarkets: OpenMarketType[]) => {
      const oldestMarket = homePage.getOldestOpenMarket(openMarkets);
      cy.getByTestId('market', { timeout: 12000 }).within(() => {
        cy.get('button')
          .contains(oldestMarket.tradableInstrument.instrument.name)
          .should('be.visible');
      });
    }
  );
});

Then(
  'the most recent current trading market is loaded on the trading tab',
  () => {
    cy.get<OpenMarketType[]>('@openMarketData').then(
      (openMarkets: OpenMarketType[]) => {
        const latestMarket = homePage.getMostRecentOpenMarket(openMarkets);
        cy.getByTestId('market', { timeout: 12000 }).within(() => {
          cy.get('button')
            .contains(latestMarket.tradableInstrument.instrument.name)
            .should('be.visible');
        });
      }
    );
  }
);

When('I click the most recent trading market', () => {
  cy.get<OpenMarketType[]>('@openMarketData').then(
    (openMarkets: OpenMarketType[]) => {
      const latestMarket = homePage.getMostRecentOpenMarket(openMarkets);
      cy.contains(latestMarket.tradableInstrument.instrument.code).click();
    }
  );
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
