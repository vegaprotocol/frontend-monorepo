Cypress.Commands.add(
  'convert_token_value_to_number',
  { prevSubject: true },
  (subject) => {
    return parseFloat(subject.replace(/,/g, ''));
  }
);

const navigation = {
  section: 'nav',
  home: '[href="/"]',
  vesting: '[href="/vesting"]',
  staking: '[href="/staking"]',
  rewards: '[href="/rewards"]',
  withdrawals: '[href="/withdrawals"]',
  governance: '[href="/governance"]',
  pageSpinner: '[data-testid="splash-loader"]',
};

Cypress.Commands.add('navigate_to', (page) => {
  return cy.get(navigation.section, { timeout: 10000 }).within(() => {
    cy.get(navigation[page]).click({ force: true });
  });
});

Cypress.Commands.add('verify_tab_highlighted', (page) => {
  return cy.get(navigation.section).within(() => {
    cy.get(navigation[page]).should('have.attr', 'aria-current');
  });
});

Cypress.Commands.add('verify_page_header', (text) => {
  return cy.get('header h1').should('be.visible').and('have.text', text);
});

Cypress.Commands.add('wait_for_spinner', () => {
  cy.get(navigation.pageSpinner, { timeout: 20000 }).should('not.exist');
});

Cypress.Commands.add('restartVegacapsuleNetwork', () => {
  Cypress.on('uncaught:exception', () => {
    // stopping the network causes errors with pending transactions
    // This stops those errors from preventing the teardown
    return false;
  });
  // We stop the network twice - since it does not always shutdown correctly on first attempt
  cy.exec('vegacapsule network destroy', { failOnNonZeroExit: false });
  cy.exec('vegacapsule network destroy', { failOnNonZeroExit: false })
    .its('stderr')
    .should('contain', 'network cleaning up success');

  cy.exec(
    'vegacapsule network bootstrap --config-path=../../vegacapsule/config.hcl --force',
    { failOnNonZeroExit: false, timeout: 100000 }
  )
    .its('stderr')
    .then((response) => {
      if (!response.includes('starting network success')) {
        cy.exec('vegacapsule network destroy', { failOnNonZeroExit: false });
        cy.exec(
          'vegacapsule network bootstrap --config-path=../../vegacapsule/config.hcl --force',
          { failOnNonZeroExit: false, timeout: 100000 }
        )
          .its('stderr')
          .then((response) => {
            return response;
          });
      }
    })
    .should('contain', 'starting network success');
});

Cypress.Commands.add(
  'associate_vega_tokens',
  (vegaInWalletTokens = 0, vestingContractTokens = 0) => {
    const vegaWallet = '[data-testid="vega-wallet"]';
    const vegaWalletAssociatedBalance = '[data-testid="currency-value"]';
    const txTimeout = Cypress.env('txTimeout');

    cy.vega_wallet_teardown();

    cy.get(vegaWallet).within(() => {
      cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', '0.0');
    });

    cy.eth_associate_tokens(vegaInWalletTokens, 'wallet');
    cy.eth_associate_tokens(vestingContractTokens, 'contract');

    cy.get(vegaWallet).within(() => {
      cy.get(vegaWalletAssociatedBalance, txTimeout).should(
        'contain',
        (vegaInWalletTokens === 0) & (vestingContractTokens === 0)
          ? '0.0'
          : vegaInWalletTokens + vestingContractTokens
      );
    });

    cy.reload();
    cy.vega_wallet_connect();
    cy.ethereum_wallet_connect();
  }
);
