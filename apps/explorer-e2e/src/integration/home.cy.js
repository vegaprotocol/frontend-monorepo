context('Home Page', function () {
  before('visit home page', function () {
    cy.visit('/');
  });

  describe('Stats page', function () {
    const statsValue = '[data-testid="stats-value"]';

    it('Should show connected environment', function () {
      const deployedEnv = Cypress.env('environment').toUpperCase();
      cy.get('[data-testid="stats-environment"]').should(
        'have.text',
        `/ ${deployedEnv}`
      );
    });

    it('should show connected environment stats', function () {
      const statTitles = {
        0: 'Status',
        1: 'Height',
        2: 'Validating nodes',
        3: 'Uptime',
        4: 'Total nodes',
        5: 'Inactive nodes',
        6: 'Total staked',
        7: 'Backlog',
        8: 'Trades / second',
        9: 'Orders / block',
        10: 'Orders / second',
        11: 'Transactions / block',
        12: 'Block time',
        13: 'Time',
        14: 'App',
        15: 'Tendermint',
        16: 'Up since',
        17: 'Chain ID',
      };

      cy.get('[data-testid="stats-title"]')
        .each(($list, index) => {
          cy.wrap($list).should('have.text', statTitles[index]);
        })
        .then(($list) => {
          cy.wrap($list).should('have.length', 18);
        });

      cy.get(statsValue).eq(0).should('have.text', 'CONNECTED');
      cy.get(statsValue).eq(1).should('not.be.empty');
      cy.get(statsValue).eq(2).should('have.text', '2');
      cy.get(statsValue)
        .eq(3)
        .invoke('text')
        .should('match', /\d+d \d+h \d+m \d+s/i);
      cy.get(statsValue).eq(4).should('have.text', '2');
      cy.get(statsValue).eq(5).should('have.text', '0');
      cy.get(statsValue)
        .eq(6)
        .invoke('text')
        .should('match', /\d+\.\d\d(?!\d)/i);
      cy.get(statsValue).eq(7).should('have.text', '0');
      cy.get(statsValue).eq(8).should('have.text', '0');
      cy.get(statsValue).eq(9).should('have.text', '0');
      cy.get(statsValue).eq(10).should('have.text', '0');
      cy.get(statsValue).eq(11).should('not.be.empty');
      cy.get(statsValue).eq(12).should('not.be.empty');
      cy.get(statsValue).eq(13).should('not.be.empty');
      if (Cypress.env('NIGHTLY_RUN') != true) {
        cy.get(statsValue)
          .eq(14)
          .invoke('text')
          .should('match', /v\d+\.\d+\.\d+/i);
      }
      cy.get(statsValue)
        .eq(15)
        .invoke('text')
        .should('match', /\d+\.\d+\.\d+/i);
      cy.get(statsValue).eq(16).should('not.be.empty');
      cy.get(statsValue).eq(17).should('not.be.empty');
    });

    it('Block height should be updating', function () {
      cy.get(statsValue)
        .eq(1)
        .invoke('text')
        .then((blockHeightTxt) => {
          cy.get(statsValue)
            .eq(1)
            .invoke('text')
            .should((newBlockHeightTxt) => {
              expect(blockHeightTxt).not.to.eq(newBlockHeightTxt);
            });
        });
    });
  });

  describe('Git info', function () {
    it('git info is rendered on the footer of the page', function () {
      cy.getByTestId('git-info').within(() => {
        cy.getByTestId('git-network-data').within(() => {
          cy.contains('Reading network data from').should('be.visible');
          cy.get('span').should('have.text', Cypress.env('networkQueryUrl'));
          cy.getByTestId('link').should('be.visible');
        });

        cy.getByTestId('git-eth-data').within(() => {
          cy.contains('Reading Ethereum data from').should('be.visible');
          cy.get('span').should('have.text', Cypress.env('ethUrl'));
        });

        cy.getByTestId('git-commit-hash').within(() => {
          cy.contains('Version/commit hash:').should('be.visible');
          cy.getByTestId('link').should('have.text', Cypress.env('commitHash'));
        });
      });
    });
  });

  describe('Search bar', function () {
    it('Successful search for specific id by block id', function () {
      const blockId = '973624';
      search(blockId);
      cy.url().should('include', blockId);
    });

    it('Successful search for specific id by tx hash', function () {
      const txHash =
        '9ED3718AA8308E7E08EC588EE7AADAF49711D2138860D8914B4D81A2054D9FB8';
      search(txHash);
      cy.url().should('include', txHash);
    });

    it('Successful search for specific id by tx id', function () {
      const txId =
        '0x61DCCEBB955087F50D0B85382DAE138EDA9631BF1A4F92E563D528904AA38898';
      search(txId);
      cy.url().should('include', txId);
    });

    it('Error message displayed when invalid search by wrong string length', function () {
      search('9ED3718AA8308E7E08EC588EE7AADAF497D2138860D8914B4D81A2054D9FB8');
      validateSearchError("Something doesn't look right");
    });

    it('Error message displayed when invalid search by invalid hash', function () {
      search(
        '9ED3718AA8308E7E08ECht8EE753DAF49711D2138860D8914B4D81A2054D9FB8'
      );
      validateSearchError('Transaction is not hexadecimal');
    });

    it('Error message displayed when searching empty field', function () {
      cy.get('[data-testid="search"]').clear();
      cy.get('[data-testid="search-button"]').click();
      validateSearchError('Search required');
    });

    function search(searchTxt) {
      cy.get('[data-testid="search"]').clear().type(searchTxt);
      cy.get('[data-testid="search-button"]').click();
    }

    function validateSearchError(expectedError) {
      cy.get('[data-testid="search-error"]').should('have.text', expectedError);
    }
  });
});
