import wallet from '../locators/wallet.locators';
import staking from '../locators/staking.locators';

// ----------------------------------------------------------------------
const walletName = Cypress.env("WALLET_NAME");
const walletPassphrase = Cypress.env("WALLET_PASSPHRASE");

Cypress.Commands.add('walletVega_create', function () {
  cy.log('**Initializing Vega Wallet**' + walletName)
  let vegaCapWalletLocation = "~/.vegacapsule/testnet/wallet";
  cy.exec(`vegawallet init -f --home ${vegaCapWalletLocation}`);
  cy.exec(`echo ${walletPassphrase} > ${vegaCapWalletLocation}/passphrase.txt`);
  cy.exec(`vegawallet create --wallet ${walletName} -p ./passphrase.txt  --home ${vegaCapWalletLocation}`,
            { failOnNonZeroExit: false })
  cy.exec(`vegawallet service run --network DV --automatic-consent  --home ${vegaCapWalletLocation}`);
  cy.log('**Initializing Vega Wallet = COMPLETE**')
});

// ----------------------------------------------------------------------

Cypress.Commands.add('walletVega_connect', function () {
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
    cy.get(wallet.name).click().type(walletName);
    cy.get(wallet.passphrase).click().type(walletPassphrase);
    cy.get('button').contains('Connect').click();
  });

  cy.contains(`${walletName} key`, { timeout: 20000 }).should('be.visible');
  // We have to wait for two fetchs of wallet balances to finish
  // Since oddly the first fetch returns a balance of 0.0 (even if tokens present)
  cy.wait('@vegaWalletGrab', {timeout : 10000}).wait('@vegaWalletGrab', {timeout : 10000});
  // Then we turn off our intercept - so that we can use it again in the future
  cy.intercept('POST', 'http://localhost:3028/query', (req) => req.continue());
  cy.log('**Connecting Vega Wallet = COMPLETE**')
});

// ----------------------------------------------------------------------

Cypress.Commands.add('walletVega_checkThisValidator_StakeNextEpochValue_is',
  function (validatorName, expectedVal) {
    cy.log(`**Checking Stake Next Epoch Value for ${validatorName} is ${expectedVal}**`)
    cy.get(wallet.vegawallet).within(() => {
      cy.contains(`${validatorName} (Next epoch)`)
        .siblings()
        .contains(parseFloat(expectedVal).toPrecision(16));
    });
    cy.log('**Checking Stake Next Epoch Value = Complete**')
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add('walletVega_check_UnstakedValue_is', function (expectedVal) {
    cy.log(`**Checking Vega Wallet Unstaked Value is ${expectedVal}**`)
    cy.get(wallet.vegawallet).within(() => {
      cy.contains('Unstaked', {timeout : 20000})
        .siblings()
        .contains(parseFloat(expectedVal).toPrecision(16), { timeout: 10000 });
    });
    cy.log('**Checking Vega Wallet Unstaked Value = Complete**')
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add('walletVega_check_associatedValue_is', function (expectedVal) {
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

Cypress.Commands.add('walletEth_connect', function () {
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

Cypress.Commands.add('walletEth_associateTokens', function (amount) {
  cy.log(`**Associating ${amount} tokens from Eth Wallet**`)
  cy.get(wallet.ethWallet).within(() =>
    cy.get(wallet.ethWalletAssociate).click());
  cy.get(staking.stakeAssociateWalletRadio, { timeout: 30000 }).click();
  cy.get(staking.tokenAmountInput, { timeout: 10000 }).type(amount);
  cy.get(staking.tokenInputSubmit, { timeout: 20000 }).should('be.enabled').click();
  cy.contains('can now participate in governance and nominate a validator', { timeout: 60000 });
  cy.log('**Associating tokens from Eth Wallet = COMPLETE**')
})

// ---------------------------------------------------------------------- 

Cypress.Commands.add('walletEth_disassociateAllTokens', function () {
  cy.log('**Disassociating tokens from Eth Wallet**')
  cy.get(wallet.ethWallet).within(() =>
    cy.get(wallet.ethWalletDisassociate).click());
  cy.get(staking.stakeAssociateWalletRadio, { timeout: 20000 }).click();
  cy.get(staking.stakeMaximumTokens, { timeout: 60000 }).click();
  cy.get(staking.tokenInputSubmit, { timeout: 10000 }).click();
  cy.contains('$VEGA tokens have been returned to Ethereum wallet', { timeout: 60000 })
  cy.walletVega_check_associatedValue_is('0.0')
  cy.log('**Disassociating tokens from Eth Wallet = Complete**')
})

// ---------------------------------------------------------------------- 

Cypress.Commands.add('walletVega_teardown', function () {
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
      cy.root().walletEth_disassociateAllTokens()
    }
    else {cy.log('**No need to teardown vega wallet - wallet empty**')}
  })
  cy.log('**Tearing down associated tokens from Vega Wallet = COMPLETE**')
})

