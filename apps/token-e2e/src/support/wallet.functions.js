import wallet from '../locators/wallet.locators';
import staking from '../locators/staking.locators';
import {StakingBridge} from '@vegaprotocol/smart-contracts';

// ----------------------------------------------------------------------
const vegaWalletName = Cypress.env("VEGA_WALLET_NAME");
const vegaWalletLocation = Cypress.env("VEGA_WALLET_LOCATION");
const vegaWalletPassphrase = Cypress.env("VEGA_WALLET_PASSPHRASE");

// ---------------------------------------------------------------------- 

Cypress.Commands.add('vega_wallet_teardown', function () {
  const token = new StakingBridge();
  const vegaPubKey = '0bd8d51ac46d563af70e4c92fdc53552f800ad527109146e9dff72f6413c10c9';
  const ethPubKey = '0xEe7D375bcB50C26d52E1A4a472D8822A2A22d94F';

  token.stakeBalance(ethPubKey, vegaPubKey).then((amount => {
    cy.log(amount)
    token.removeStake(amount, vegaPubKey)
  }))
})

// ---------------------------------------------------------------------- 

Cypress.Commands.add('vega_wallet_teardown_ui', function () {
  cy.log('**Tearing down associated tokens from Vega Wallet**')
  let vegaPresentInWallet = false;
  cy.get(wallet.vegawallet).within(() => {
    cy.contains('Associated', {timeout : 20000})
      .parent()
      .siblings()
      .within(($associated) => {
        if ($associated.text() != '0.000000000000000000')
        vegaPresentInWallet = true;
      })
  }).then(() => {
    if (vegaPresentInWallet == true) {
      cy.root().ethereum_wallet_disassociateAllTokens()
      cy.vega_wallet_check_associatedValue_is('0.0')
    }
    else {cy.log('**No need to teardown vega wallet - wallet empty**')}
  })
  cy.log('**Tearing down associated tokens from Vega Wallet = COMPLETE**')
})

// ---------------------------------------------------------------------- 

Cypress.Commands.add('vega_wallet_create', function () {
  cy.log('**Initializing Vega Wallet** ' + vegaWalletName)
  cy.exec(`vegawallet init -f --home ${vegaWalletLocation}`)
  cy.exec(`echo ${vegaWalletPassphrase} > ./src/fixtures/vegaWalletPassphrase.txt`)
  cy.exec(`vegawallet create -w ${vegaWalletName} -p ./src/fixtures//vegaWalletPassphrase.txt --home ${vegaWalletLocation}`,
            { failOnNonZeroExit: false }).then(result => cy.log(result.stderr))
  cy.exec(`vegawallet service run --network DV --automatic-consent  --home ${vegaWalletLocation}`)

  cy.log('**Initializing Vega Wallet = COMPLETE**')
});

// ----------------------------------------------------------------------

Cypress.Commands.add('vega_wallet_connect', function () {
  cy.log('**Connecting Vega Wallet**')
  cy.intercept('POST', 'http://localhost:3028/query').as('vegaWalletGrab')
  cy.get(wallet.vegawallet).within(() => {
    cy.get('button')
      .contains('Connect Vega wallet to use associated $VEGA')
      .should('be.enabled')
      .and('be.visible')
      .click({ force: true });
  });

  cy.get('button').contains('rest provider').click();

  cy.get(wallet.connectRestForm).within(() => {
    cy.get(wallet.name).click().type(vegaWalletName);
    cy.get(wallet.passphrase).click().type(vegaWalletPassphrase);
    cy.get('button').contains('Connect').click();
  });

  cy.contains(`${vegaWalletName} key`, { timeout: 20000 }).should('be.visible');
  // We have to wait for two fetchs of wallet balances to finish
  // Since oddly the first fetch returns a balance of 0.0 (even if tokens present)
  cy.wait('@vegaWalletGrab', {timeout : 10000}).wait('@vegaWalletGrab', {timeout : 10000});
  // Then we turn off our intercept - so that we can use it again in the future
  cy.intercept('POST', 'http://localhost:3028/query', (req) => req.continue());
  cy.log('**Connecting Vega Wallet = COMPLETE**')
});

// ----------------------------------------------------------------------

Cypress.Commands.add('vega_wallet_check_validator_stakeNextEpochValue_is',
  function (validatorName, expectedVal) {
    cy.log(`**Checking Stake Next Epoch Value for ${validatorName} is ${expectedVal}**`)
    cy.get(wallet.vegawallet).within(() => {
      cy.contains(`${validatorName} (Next epoch)`)
        .siblings()
        .contains(expectedVal, { timeout: 10000 });
    });
    cy.log('**Checking Stake Next Epoch Value = Complete**')
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add('vega_wallet_check_unstakedValue_is', function (expectedVal) {
    cy.log(`**Checking Vega Wallet Unstaked Value is ${expectedVal}**`)
    cy.get(wallet.vegawallet).within(() => {
      cy.contains('Unstaked', {timeout : 20000})
        .siblings()
        .contains(expectedVal, { timeout: 10000 });
    });
    cy.log('**Checking Vega Wallet Unstaked Value = Complete**')
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add('vega_wallet_check_associatedValue_is', function (expectedVal) {
    cy.log(`**Checking Vega Wallet Asscoiated Value is ${expectedVal}**`)
    cy.get(wallet.vegawallet).within(() => {
      cy.contains('Associated', {timeout : 20000})
        .parent()
        .siblings()
        .contains(expectedVal, {timeout : 40000});
    });
    cy.log('**Checking Vega Wallet Asscoiated Value = COMPLETE**')
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add('ethereum_wallet_connect', function () {
  cy.log('**Connecting Eth Wallet**');
  cy.get(wallet.ethWalletConnectToEth).within(() => {
    cy.contains('Connect Ethereum wallet to associate $VEGA')
      .should('be.visible')
      .click()});
  cy.get(wallet.ethWalletConnect).click();
  cy.get(wallet.ethWalletConnect, {timeout : 60000}).should('not.exist')
  cy.contains('Ethereum wallet connected').should('be.visible');
  cy.log('**Connecting Eth Wallet = COMPLETE**')
});

// ----------------------------------------------------------------------

Cypress.Commands.add('ethereum_wallet_associateTokens', function (amount) {
  cy.log(`**Associating ${amount} tokens from Eth Wallet**`)
  cy.get(wallet.ethWallet).within(() =>
    cy.get(wallet.ethWalletAssociate).click());
  cy.get(staking.stakeAssociateWalletRadio, { timeout: 30000 }).click();
  cy.get(staking.tokenAmountInput, { timeout: 10000 }).type(amount);
  cy.get(staking.tokenInputSubmit, { timeout: 40000 }).should('be.enabled').click();
  cy.contains('can now participate in governance and nominate a validator', { timeout: 60000 });
  cy.log('**Associating tokens from Eth Wallet = COMPLETE**')
})

// ----------------------------------------------------------------------

Cypress.Commands.add('ethereum_wallet_approveAndAssociateTokens', function (amount) {
  cy.log(`**Associating ${amount} tokens from Eth Wallet**`)
  cy.get(wallet.ethWallet).within(() =>
    cy.get(wallet.ethWalletAssociate).click());
  cy.get(staking.stakeAssociateWalletRadio, { timeout: 30000 }).click();
  cy.get(staking.tokenAmountInput, { timeout: 10000 }).type(amount);
  cy.get(staking.tokenInputApprove, { timeout: 40000 }).should('be.enabled').click();
  cy.get(staking.tokenInputSubmit, { timeout: 40000 }).should('be.enabled').click();
  cy.contains('can now participate in governance and nominate a validator', { timeout: 60000 });
  cy.log('**Associating tokens from Eth Wallet = COMPLETE**')
})

// ---------------------------------------------------------------------- 

Cypress.Commands.add('ethereum_wallet_disassociateAllTokens', function () {
  cy.log('**Disassociating tokens from Eth Wallet**')
  cy.get(wallet.ethWallet).within(() =>
    cy.get(wallet.ethWalletDisassociate).click());
  cy.get(staking.stakeAssociateWalletRadio, { timeout: 20000 }).click();
  cy.get(staking.stakeMaximumTokens, { timeout: 60000 }).click();
  cy.get(staking.tokenInputSubmit, { timeout: 10000 }).click();
  cy.contains('$VEGA tokens have been returned to Ethereum wallet', { timeout: 60000 })
  cy.log('**Disassociating tokens from Eth Wallet = Complete**')
})

// ---------------------------------------------------------------------- 

