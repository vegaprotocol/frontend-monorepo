const vegaWalletContainer = '[data-testid="vega-wallet"]';
const restConnectorForm = '[data-testid="rest-connector-form"]';
const vegaWalletNameElement = '[data-testid="wallet-name"]';
const vegaWalletName = Cypress.env('vegaWalletName');
const vegaWalletPassphrase = Cypress.env('vegaWalletPassphrase');

Cypress.Commands.add('vega_wallet_connect', () => {
  cy.highlight('Connecting Vega Wallet');
  cy.get(vegaWalletContainer).within(() => {
    cy.get('button')
      .contains('Connect Vega wallet to use associated $VEGA')
      .should('be.enabled')
      .and('be.visible')
      .click({ force: true });
  });
  // Connect with gui as its the v1 service and tests should still pass. This will need
  // to be update to use v2
  cy.getByTestId('connector-gui').click();
  cy.get(restConnectorForm).within(() => {
    cy.get('#wallet').click().type(vegaWalletName);
    cy.get('#passphrase').click().type(vegaWalletPassphrase);
    cy.get('button').contains('Connect').click();
  });
  cy.get(vegaWalletNameElement).should('be.visible');
});

Cypress.Commands.add(
  'vega_wallet_faucet_assets_without_check',
  function (asset, amount, vegaWalletPublicKey) {
    cy.highlight(`Topping up vega wallet with ${asset}, amount: ${amount}`);
    cy.exec(
      `curl -X POST -d '{"amount": "${amount}", "asset": "${asset}", "party": "${vegaWalletPublicKey}"}' http://localhost:1790/api/v1/mint`
    )
      .its('stdout')
      .then((response) => {
        assert.include(
          response,
          `"success":true`,
          'Ensuring curl command was successfully undertaken'
        );
      });
  }
);

// {
//     "VOTE": {
//         "name": "VOTE",
//         "id": "VOTE",
//         "symbol": "VOTE",
//         "decimals": 5,
//         "source": {
//             "__typename": "BuiltinAsset",
//             "maxFaucetAmountMint": "10000"
//         },
//         "infrastructureFeeAccount": {
//             "__typename": "Account",
//             "type": "ACCOUNT_TYPE_FEES_INFRASTRUCTURE",
//             "balance": "0"
//         },
//         "globalRewardPoolAccount": {
//             "balance": "0"
//         }
//     },
//     "XYZ (α alpha)": {
//         "name": "XYZ (α alpha)",
//         "id": "XYZalpha",
//         "symbol": "XYZalpha",
//         "decimals": 5,
//         "source": {
//             "__typename": "BuiltinAsset",
//             "maxFaucetAmountMint": "100000000000"
//         },
//         "infrastructureFeeAccount": {
//             "__typename": "Account",
//             "type": "ACCOUNT_TYPE_FEES_INFRASTRUCTURE",
//             "balance": "0"
//         },
//         "globalRewardPoolAccount": {
//             "balance": "0"
//         }
//     },
//     "XYZ (β beta)": {
//         "name": "XYZ (β beta)",
//         "id": "XYZbeta",
//         "symbol": "XYZbeta",
//         "decimals": 5,
//         "source": {
//             "__typename": "BuiltinAsset",
//             "maxFaucetAmountMint": "100000000000"
//         },
//         "infrastructureFeeAccount": {
//             "__typename": "Account",
//             "type": "ACCOUNT_TYPE_FEES_INFRASTRUCTURE",
//             "balance": "0"
//         },
//         "globalRewardPoolAccount": {
//             "balance": "0"
//         }
//     },
//     "XYZ (δ delta)": {
//         "name": "XYZ (δ delta)",
//         "id": "XYZdelta",
//         "symbol": "XYZdelta",
//         "decimals": 5,
//         "source": {
//             "__typename": "BuiltinAsset",
//             "maxFaucetAmountMint": "100000000000"
//         },
//         "infrastructureFeeAccount": {
//             "__typename": "Account",
//             "type": "ACCOUNT_TYPE_FEES_INFRASTRUCTURE",
//             "balance": "0"
//         },
//         "globalRewardPoolAccount": {
//             "balance": "0"
//         }
//     },
//     "XYZ (ε epsilon)": {
//         "name": "XYZ (ε epsilon)",
//         "id": "XYZepsilon",
//         "symbol": "XYZepsilon",
//         "decimals": 5,
//         "source": {
//             "__typename": "BuiltinAsset",
//             "maxFaucetAmountMint": "100000000000"
//         },
//         "infrastructureFeeAccount": {
//             "__typename": "Account",
//             "type": "ACCOUNT_TYPE_FEES_INFRASTRUCTURE",
//             "balance": "0"
//         },
//         "globalRewardPoolAccount": {
//             "balance": "0"
//         }
//     },
//     "XYZ (γ gamma)": {
//         "name": "XYZ (γ gamma)",
//         "id": "XYZgamma",
//         "symbol": "XYZgamma",
//         "decimals": 5,
//         "source": {
//             "__typename": "BuiltinAsset",
//             "maxFaucetAmountMint": "100000000000"
//         },
//         "infrastructureFeeAccount": {
//             "__typename": "Account",
//             "type": "ACCOUNT_TYPE_FEES_INFRASTRUCTURE",
//             "balance": "0"
//         },
//         "globalRewardPoolAccount": {
//             "balance": "0"
//         }
//     },
//     "BTC (fake)": {
//         "name": "BTC (fake)",
//         "id": "fBTC",
//         "symbol": "fBTC",
//         "decimals": 5,
//         "source": {
//             "__typename": "BuiltinAsset",
//             "maxFaucetAmountMint": "1000000"
//         },
//         "infrastructureFeeAccount": {
//             "__typename": "Account",
//             "type": "ACCOUNT_TYPE_FEES_INFRASTRUCTURE",
//             "balance": "0"
//         },
//         "globalRewardPoolAccount": {
//             "balance": "0"
//         }
//     },
//     "DAI (fake)": {
//         "name": "DAI (fake)",
//         "id": "fDAI",
//         "symbol": "fDAI",
//         "decimals": 5,
//         "source": {
//             "__typename": "BuiltinAsset",
//             "maxFaucetAmountMint": "10000000000"
//         },
//         "infrastructureFeeAccount": {
//             "__typename": "Account",
//             "type": "ACCOUNT_TYPE_FEES_INFRASTRUCTURE",
//             "balance": "0"
//         },
//         "globalRewardPoolAccount": {
//             "balance": "0"
//         }
//     },
//     "EURO (fake)": {
//         "name": "EURO (fake)",
//         "id": "fEURO",
//         "symbol": "fEURO",
//         "decimals": 5,
//         "source": {
//             "__typename": "BuiltinAsset",
//             "maxFaucetAmountMint": "10000000000"
//         },
//         "infrastructureFeeAccount": {
//             "__typename": "Account",
//             "type": "ACCOUNT_TYPE_FEES_INFRASTRUCTURE",
//             "balance": "0"
//         },
//         "globalRewardPoolAccount": {
//             "balance": "0"
//         }
//     },
//     "USDC (fake)": {
//         "name": "USDC (fake)",
//         "id": "fUSDC",
//         "symbol": "fUSDC",
//         "decimals": 5,
//         "source": {
//             "__typename": "BuiltinAsset",
//             "maxFaucetAmountMint": "1000000000000"
//         },
//         "infrastructureFeeAccount": {
//             "__typename": "Account",
//             "type": "ACCOUNT_TYPE_FEES_INFRASTRUCTURE",
//             "balance": "0"
//         },
//         "globalRewardPoolAccount": {
//             "balance": "0"
//         }
//     },
//     "BTC (local)": {
//         "name": "BTC (local)",
//         "id": "5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c",
//         "symbol": "tBTC",
//         "decimals": 5,
//         "source": {
//             "__typename": "ERC20",
//             "contractAddress": "0xb63D135B0a6854EEb765d69ca36210cC70BECAE0"
//         },
//         "infrastructureFeeAccount": {
//             "__typename": "Account",
//             "type": "ACCOUNT_TYPE_FEES_INFRASTRUCTURE",
//             "balance": "0"
//         },
//         "globalRewardPoolAccount": {
//             "balance": "0"
//         }
//     },
//     "DAI (local)": {
//         "name": "DAI (local)",
//         "id": "6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61",
//         "symbol": "tDAI",
//         "decimals": 5,
//         "source": {
//             "__typename": "ERC20",
//             "contractAddress": "0x879B84eCA313D62CE4e5ED717939B42cBa9e53cb"
//         },
//         "infrastructureFeeAccount": {
//             "__typename": "Account",
//             "type": "ACCOUNT_TYPE_FEES_INFRASTRUCTURE",
//             "balance": "0"
//         },
//         "globalRewardPoolAccount": {
//             "balance": "0"
//         }
//     },
//     "EURO (local)": {
//         "name": "EURO (local)",
//         "id": "8b52d4a3a4b0ffe733cddbc2b67be273816cfeb6ca4c8b339bac03ffba08e4e4",
//         "symbol": "tEURO",
//         "decimals": 5,
//         "source": {
//             "__typename": "ERC20",
//             "contractAddress": "0x7ccE194dAEf2A4e5C23C78C9330D4c907eCA6980"
//         },
//         "infrastructureFeeAccount": {
//             "__typename": "Account",
//             "type": "ACCOUNT_TYPE_FEES_INFRASTRUCTURE",
//             "balance": "0"
//         },
//         "globalRewardPoolAccount": {
//             "balance": "0"
//         }
//     },
//     "USDC (local)": {
//         "name": "USDC (local)",
//         "id": "993ed98f4f770d91a796faab1738551193ba45c62341d20597df70fea6704ede",
//         "symbol": "tUSDC",
//         "decimals": 5,
//         "source": {
//             "__typename": "ERC20",
//             "contractAddress": "0x1b8a1B6CBE5c93609b46D1829Cc7f3Cb8eeE23a0"
//         },
//         "infrastructureFeeAccount": {
//             "__typename": "Account",
//             "type": "ACCOUNT_TYPE_FEES_INFRASTRUCTURE",
//             "balance": "0"
//         },
//         "globalRewardPoolAccount": {
//             "balance": "0"
//         }
//     },
//     "Vega": {
//         "name": "Vega",
//         "id": "b4f2726571fbe8e33b442dc92ed2d7f0d810e21835b7371a7915a365f07ccd9b",
//         "symbol": "VEGA",
//         "decimals": 18,
//         "source": {
//             "__typename": "ERC20",
//             "contractAddress": "0x67175Da1D5e966e40D11c4B2519392B2058373de"
//         },
//         "infrastructureFeeAccount": {
//             "__typename": "Account",
//             "type": "ACCOUNT_TYPE_FEES_INFRASTRUCTURE",
//             "balance": "0"
//         },
//         "globalRewardPoolAccount": {
//             "balance": "0"
//         }
//     }
// }
