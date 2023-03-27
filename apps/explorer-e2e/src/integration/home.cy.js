context('Home Page', function () {
  before('visit home page', function () {
    cy.visit('/');
  });

  describe('Stats page', { tags: '@smoke' }, function () {
    const statsValue = '[data-testid="stats-value"]';

    it('should show connected environment stats', function () {
      const statTitles = {
        0: 'Status',
        1: 'Block height',
        2: 'Uptime',
        3: 'Total nodes',
        4: 'Total staked',
        5: 'Backlog',
        6: 'Trades / second',
        7: 'Orders / block',
        8: 'Orders / second',
        9: 'Transactions / block',
        10: 'Block time',
        11: 'Time',
        12: 'App',
        13: 'Tendermint',
        14: 'Up since',
        15: 'Chain ID',
      };

      cy.get('[data-testid="stats-title"]')
        .each(($list, index) => {
          cy.wrap($list).should('contain.text', statTitles[index]);
        })
        .then(($list) => {
          cy.wrap($list).should('have.length', 16);
        });

      cy.get(statsValue).eq(0).should('contain.text', 'CONNECTED');
      cy.get(statsValue).eq(1).should('not.be.empty');
      cy.get(statsValue)
        .eq(2)
        .invoke('text')
        .should('match', /\d+d \d+h \d+m \d+s/i);
      cy.get(statsValue).eq(3).should('contain.text', '2');
      cy.get(statsValue)
        .eq(4)
        .invoke('text')
        .should('match', /\d+\.\d\d(?!\d)/i);
      cy.get(statsValue).eq(5).should('contain.text', '0');
      cy.get(statsValue).eq(6).should('contain.text', '0');
      cy.get(statsValue).eq(7).should('contain.text', '0');
      cy.get(statsValue).eq(8).should('contain.text', '0');
      cy.get(statsValue).eq(9).should('not.be.empty');
      cy.get(statsValue).eq(10).should('not.be.empty');
      cy.get(statsValue).eq(11).should('not.be.empty');
      cy.get(statsValue)
        .eq(12)
        .invoke('text')
        .should('match', /v\d+\.\d+\.\d+/i);
      cy.get(statsValue)
        .eq(13)
        .invoke('text')
        .should('match', /\d+\.\d+\.\d+/i);
      cy.get(statsValue).eq(14).should('not.be.empty');
      cy.get(statsValue).eq(15).should('not.be.empty');
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
});
