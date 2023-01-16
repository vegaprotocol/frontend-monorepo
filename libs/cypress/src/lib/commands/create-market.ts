import { getMarkets, proposeAndVoteMarket } from '../capsule/create-market';
import { setupEthereumAccount } from '../capsule/ethereum-setup';
import { faucetAsset } from '../capsule/faucet-asset';
import { setEndpoints } from '../capsule/request';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      createMarket(): void;
    }
  }
}
export const addCreateMarket = () => {
  Cypress.Commands.add('createMarket', () => {
    const config = {
      vegaPubKey: Cypress.env('VEGA_PUBLIC_KEY'),
      token: Cypress.env('VEGA_WALLET_API_TOKEN'),
      ethWalletMnemonic: Cypress.env('ETH_WALLET_MNEMONIC'),
      ethereumProviderUrl: Cypress.env('ETHEREUM_PROVIDER_URL'),
      vegaWalletUrl: Cypress.env('VEGA_WALLET_URL'),
      vegaUrl: Cypress.env('VEGA_URL'),
      faucetUrl: Cypress.env('FAUCET_URL'),
    };

    cy.highlight('creating market on capsule environment');

    cy.wrap(setEndpoints(config.vegaWalletUrl, config.vegaUrl))
      .then(() => {
        cy.log('fetching newly created markets');
        return getMarkets();
      })
      // eslint-disable-next-line
      .then((markets: any) => {
        console.log(markets);
        if (markets.length) return markets;

        cy.log('setupEthereumAccount');
        return cy.wrap(
          setupEthereumAccount(
            config.vegaPubKey,
            config.ethWalletMnemonic,
            config.ethereumProviderUrl
          ),
          {
            timeout: 5 * 60 * 1000,
          }
        );
      })
      .then((markets) => {
        if (markets.length) return markets;
        cy.log('faucetAsset');
        return cy.wrap(
          faucetAsset(config.faucetUrl, 'fUSDC', config.vegaPubKey),
          {
            timeout: 120000,
          }
        );
      })
      .then((markets) => {
        if (markets.length) return markets;
        cy.log('proposeAndVote');
        return cy.wrap(proposeAndVoteMarket(config), { timeout: 120000 });
      })
      .then((markets) => {
        console.log('markets passed down', markets);
        if (markets.length) {
          return cy.wrap(markets).as('markets');
        }
        cy.log('fetching newly created markets');
        return cy.wrap(getMarkets()).as('markets');
      });
  });
};
