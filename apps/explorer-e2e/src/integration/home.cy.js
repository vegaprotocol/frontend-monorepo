context('Home Page', function () {
  before('visit home page', function () {
    cy.visit('/');
  });

  describe('Stats page', { tags: '@smoke' }, function () {
    const statsValue = '[data-testid="stats-value"]';

    it('should show connected environment stats', function () {
      const statTitles = {
        0: 'Status',
        1: 'Epoch',
        2: 'Block height',
        3: 'Uptime',
        4: 'Total nodes',
        5: 'Total staked',
        6: 'Backlog',
        7: 'Trades / second',
        8: 'Orders / block',
        9: 'Orders / second',
        10: 'Transactions / block',
        11: 'Block time',
        12: 'Time',
        13: 'App',
        14: 'Tendermint',
        15: 'Up since',
        16: 'Chain ID',
      };

      cy.get('[data-testid="stats-title"]')
        .each(($list, index) => {
          cy.wrap($list).should('contain.text', statTitles[index]);
        })
        .then(($list) => {
          cy.wrap($list).should('have.length', 17);
        });

      cy.get(statsValue).eq(0).should('contain.text', 'CONNECTED');
      cy.get(statsValue).eq(1).should('not.be.empty');
      cy.get(statsValue).eq(5).should('contain.text', '0');
      cy.get(statsValue).eq(6).should('contain.text', '0');
      cy.get(statsValue).eq(7).should('contain.text', '0');
      cy.get(statsValue).eq(8).should('contain.text', '0');
      cy.get(statsValue).eq(9).should('not.be.empty');
      cy.get(statsValue).eq(10).should('not.be.empty');
      cy.get(statsValue).eq(11).should('not.be.empty');
      cy.get(statsValue).eq(14).should('not.be.empty');
      cy.get(statsValue).eq(15).should('not.be.empty');
    });

    it('Block height should be updating', function () {
      cy.get(statsValue)
        .eq(2)
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
