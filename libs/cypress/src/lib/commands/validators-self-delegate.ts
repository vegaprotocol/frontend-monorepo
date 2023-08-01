import { gql } from 'graphql-request';
import { selfDelegate } from '../capsule/self-delegate';
import { requestGQL, setGraphQLEndpoint } from '../capsule/request';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      validatorsSelfDelegate(): void;
    }
  }
}

export const addValidatorsSelfDelegate = () => {
  Cypress.Commands.add('validatorsSelfDelegate', () => {
    const config = {
      ethWalletMnemonic: Cypress.env('ETH_WALLET_MNEMONIC'),
      ethereumProviderUrl: Cypress.env('ETHEREUM_PROVIDER_URL'),
      vegaWalletUrl: Cypress.env('VEGA_WALLET_URL'),
      vegaUrl: Cypress.env('VEGA_URL'),
      faucetUrl: Cypress.env('FAUCET_URL'),
    };
    setGraphQLEndpoint(config.vegaUrl);
    cy.wrap(getStakedByOperator()).as('selfStakeAmount');
    cy.get('@selfStakeAmount').then((selfStakeAmount) => {
      if (String(selfStakeAmount) == '0') {
        // Get node wallet recovery phrases
        cy.exec('vegacapsule nodes ls --home-path ~/.vegacapsule/testnet/')
          .its('stdout')
          .then((result) => {
            const obj = JSON.parse(result);
            // eslint-disable-next-line no-console
            console.log(obj);
            cy.writeFile(
              './src/fixtures/wallet/node0RecoveryPhrase',
              obj['testnet-nodeset-validators-0-validator'].Vega.NodeWalletInfo
                .VegaWalletRecoveryPhrase
            );
            cy.writeFile(
              './src/fixtures/wallet/node1RecoveryPhrase',
              obj['testnet-nodeset-validators-1-validator'].Vega.NodeWalletInfo
                .VegaWalletRecoveryPhrase
            );
            cy.wrap(
              obj['testnet-nodeset-validators-0-validator'].Vega.NodeWalletInfo
                .VegaWalletPublicKey
            ).as('node0PubKey');
            cy.wrap(
              obj['testnet-nodeset-validators-1-validator'].Vega.NodeWalletInfo
                .VegaWalletPublicKey
            ).as('node1PubKey');

            cy.wrap(
              obj['testnet-nodeset-validators-0-validator'].Vega.NodeWalletInfo
                .VegaWalletID
            ).as('node0Id');
            cy.wrap(
              obj['testnet-nodeset-validators-1-validator'].Vega.NodeWalletInfo
                .VegaWalletID
            ).as('node1Id');
          });

        // Import node wallets
        cy.exec(
          'vega wallet import -w node0_wallet --recovery-phrase-file ./src/fixtures/wallet/node0RecoveryPhrase -p ./src/fixtures/wallet/passphrase --home ~/.vegacapsule/testnet/wallet'
        );
        cy.exec(
          'vega wallet import -w node1_wallet --recovery-phrase-file ./src/fixtures/wallet/node1RecoveryPhrase -p ./src/fixtures/wallet/passphrase --home ~/.vegacapsule/testnet/wallet'
        );

        // Initialise api token
        cy.exec(
          'vega wallet api-token init --home ~/.vegacapsule/testnet/wallet --passphrase-file ./src/fixtures/wallet/passphrase'
        );

        // Generate api tokens for wallets
        cy.exec(
          'vega wallet api-token generate --wallet-name node0_wallet --tokens-passphrase-file ./src/fixtures/wallet/passphrase  --wallet-passphrase-file ./src/fixtures/wallet/passphrase --home ~/.vegacapsule/testnet/wallet'
        )
          .its('stdout')
          .then((result) => {
            const apiToken = result.match('[a-zA-Z0-9]{64}');
            if (apiToken) {
              cy.wrap(apiToken[0]).as('node0ApiToken');
            }
          });

        cy.exec(
          'vega wallet api-token generate --wallet-name node1_wallet --tokens-passphrase-file ./src/fixtures/wallet/passphrase  --wallet-passphrase-file ./src/fixtures/wallet/passphrase --home ~/.vegacapsule/testnet/wallet'
        )
          .its('stdout')
          .then((result) => {
            const apiToken = result.match('[a-zA-Z0-9]{64}');
            if (apiToken) {
              cy.wrap(apiToken[0]).as('node1ApiToken');
            }
          });

        cy.updateCapsuleMultiSig();
        cy.highlight('Validators self-delegating');

        // Self delegating Node 0 wallet
        cy.get('@node0PubKey').then((node0PubKey) => {
          cy.get('@node0ApiToken').then((node0ApiToken) => {
            cy.get('@node0Id').then((node0Id) => {
              cy.wrap(
                selfDelegate(
                  config,
                  String(node0PubKey),
                  String(node0ApiToken),
                  String(node0Id)
                ),
                { timeout: 60000 }
              );
              // Self delegating Node 1 wallet
              cy.get('@node1PubKey').then((node1PubKey) => {
                cy.get('@node1ApiToken').then((node1ApiToken) => {
                  cy.get('@node1Id').then((node1Id) => {
                    cy.wrap(
                      selfDelegate(
                        config,
                        String(node1PubKey),
                        String(node1ApiToken),
                        String(node1Id)
                      ),
                      { timeout: 60000 }
                    );
                  });
                });
              });
            });
          });
        });
      }
    });
  });
};

async function getStakedByOperator() {
  const query = gql`
    query ExplorerNodes {
      nodesConnection {
        edges {
          node {
            stakedByOperator
          }
        }
      }
    }
  `;

  const res = await requestGQL<{
    nodesConnection: {
      edges: Array<{
        node: {
          stakedByOperator: string;
        };
      }>;
    };
  }>(query);

  return res.nodesConnection.edges[0].node.stakedByOperator;
}
