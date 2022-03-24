describe('stats', () => {
  beforeEach(() => cy.visit('/'));

  let textToCheck = '';

  const dataNodeUrl = process.env['NX_VEGA_URL'];

  if (dataNodeUrl) {
    if (dataNodeUrl.includes('api')) {
      textToCheck = 'Mainnet';
    }

    if (dataNodeUrl.includes('testnet')) {
      textToCheck = 'Testnet';
    }

    if (dataNodeUrl.includes('n04.d')) {
      textToCheck = 'Devnet';
    }

    if (dataNodeUrl.includes('n03.s.vega')) {
      textToCheck = 'Stagnet 1';
    }

    if (dataNodeUrl.includes('stagnet2')) {
      textToCheck = 'Stagnet 2';
    }
  } else {
    // Network-stats falls back to showing Mainnet stats if no
    // environment variables have been set
    textToCheck = 'Mainnet';
  }

  it('should display header based on environment', () => {
    cy.get('h3').should('have.text', `/ ${textToCheck}`);
  });
});
