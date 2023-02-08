import { setGraphQLEndpoint } from '../capsule/request';
import { createWalletClient } from '../capsule/wallet-client';
import { createEthereumWallet } from '../capsule/ethereum-wallet';
import { selfDelegate } from '../capsule/self-delegate';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      validatorsSelfDelegate(nodeNum: number): void;
    }
  }
}

export const addValidatorsSelfDelegate = () => {
  Cypress.Commands.add('validatorsSelfDelegate', (nodeNum) => {
    let vegaWalletPubKey;
    let walletApiToken;
    let nodeId;

    if (nodeNum == 0) {
      vegaWalletPubKey =
        '203e708a2b7ea8612d6bcaba609e3ebda6b173339c6cb08045ce964204e9e395';
      walletApiToken = Cypress.env('VEGA_WALLET_API_TOKEN_NODE0');
      nodeId =
        '721ad5a391efb43f619ea142c5169eb93063dab29f6d2ff0b6afe6a2e4088824';
    } else if (nodeNum == 1) {
      vegaWalletPubKey =
        '94a55ed4d5a95ce6a5bec0b3aa4876de787bdd76d4d55dd749b9998d667f9829';
      walletApiToken = Cypress.env('VEGA_WALLET_API_TOKEN_NODE1');
      nodeId =
        '629b93f83836b24e5f875482cd22c393d965bddbe17737449a31185edb6f932b';
    } else {
      throw new Error('Must specify node 0 or 1 to self delegate');
    }

    const config = {
      vegaPubKey: vegaWalletPubKey,
      token: walletApiToken,
      ethWalletMnemonic: Cypress.env('ETH_WALLET_MNEMONIC'),
      ethereumProviderUrl: Cypress.env('ETHEREUM_PROVIDER_URL'),
      vegaWalletUrl: Cypress.env('VEGA_WALLET_URL'),
      vegaUrl: Cypress.env('VEGA_URL'),
      faucetUrl: Cypress.env('FAUCET_URL'),
      nodeId: nodeId,
    };

    cy.highlight('Validators self-delegating');

    selfDelegate(config);
  });
};
