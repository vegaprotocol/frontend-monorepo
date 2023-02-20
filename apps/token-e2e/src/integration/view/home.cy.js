const navSection = 'nav';
const navSupply = '[href="/token/tranches"]';
const navToken = '[href="/token"]';
const navStaking = '[href="/validators"]';
const navRewards = '[href="/rewards"]';
const navWithdraw = '[href="/token/withdraw"]';
const navGovernance = '[href="/proposals"]';
const navRedeem = '[href="/token/redeem"]';

context('Home Page - verify elements on page', { tags: '@smoke' }, function () {
  before('visit token home page', function () {
    cy.visit('/');
  });

  describe('with wallets disconnected', function () {
    before('wait for page to load', function () {
      cy.get(navSection, { timeout: 10000 }).should('be.visible');
    });

    describe('Navigation tabs', function () {
      it('should have proposals tab', function () {
        cy.get(navSection).within(() => {
          cy.get(navGovernance).should('be.visible');
        });
      });
      it('should have validators tab', function () {
        cy.get(navSection).within(() => {
          cy.get(navStaking).should('be.visible');
        });
      });
      it('should have rewards tab', function () {
        cy.get(navSection).within(() => {
          cy.get(navRewards).should('be.visible');
        });
      });

      describe('Token dropdown', function () {
        before('click on token dropdown', function () {
          cy.get(navSection).within(() => {
            cy.getByTestId('state-trigger').realClick();
          });
        });
        it('should have token dropdown', function () {
          cy.get(navToken).should('be.visible');
        });
        it('should have supply & vesting dropdown', function () {
          cy.get(navSupply).should('be.visible');
        });
        it('should have withdraw dropdown', function () {
          cy.get(navWithdraw).should('be.visible');
        });
        it('should have redeem dropdown', function () {
          cy.get(navRedeem).should('be.visible');
        });
      });
    });

    describe('Links and buttons', function () {
      it('should have link for proposal page', function () {
        cy.getByTestId('home-proposals').within(() => {
          cy.get('[href="/proposals"]')
            .should('exist')
            .and('have.text', 'Browse, vote, and propose');
        });
      });
      it('should show open or enacted proposals with proposal summary', function () {
        cy.get('body').then(($body) => {
          if (!$body.find('[data-testid="proposals-list-item"]').length) {
            cy.createMarket();
            cy.reload();
            cy.wait_for_spinner();
          }
        });
        cy.getByTestId('proposals-list-item')
          .should('have.length.at.least', 1)
          .first()
          .within(() => {
            cy.getByTestId('proposal-title')
              .invoke('text')
              .should('not.be.empty');
            cy.getByTestId('proposal-type')
              .invoke('text')
              .should('not.be.empty');
            cy.getByTestId('proposal-description')
              .invoke('text')
              .should('not.be.empty');
            cy.getByTestId('proposal-details')
              .invoke('text')
              .should('not.be.empty');
            cy.getByTestId('proposal-status')
              .invoke('text')
              .should('not.be.empty');
            cy.getByTestId('vote-details')
              .invoke('text')
              .should('not.be.empty');
            cy.getByTestId('view-proposal-btn').should('be.visible');
          });
      });
      it('should have external link for governance', function () {
        cy.getByTestId('home-proposals').within(() => {
          cy.getByTestId('external-link')
            .should('have.attr', 'href')
            .and('contain', 'https://vega.xyz/governance');
        });
      });
      it('should have link for validator page', function () {
        cy.getByTestId('home-validators').within(() => {
          cy.get('[href="/validators"]')
            .first()
            .should('exist')
            .and('have.text', 'Browse, and stake');
        });
      });
      it('should have external link for validators', function () {
        cy.getByTestId('home-validators').within(() => {
          cy.getByTestId('external-link')
            .should('have.attr', 'href')
            .and(
              'contain',
              'https://community.vega.xyz/c/mainnet-validator-candidates'
            );
        });
      });
      it('should have information on active nodes', function () {
        cy.getByTestId('node-information')
          .first()
          .should('contain.text', '2')
          .and('contain.text', 'active nodes');
      });
      it('should have information on consensus nodes', function () {
        cy.getByTestId('node-information')
          .last()
          .should('contain.text', '2')
          .and('contain.text', 'consensus nodes');
      });
      it('should contain link to specific validators', function () {
        cy.getByTestId('validators')
          .should('have.length', '2')
          .each(($validator) => {
            cy.wrap($validator).find('a').should('have.attr', 'href');
          });
      });
      it('should have link for rewards page', function () {
        cy.getByTestId('home-rewards').within(() => {
          cy.get('[href="/rewards"]')
            .first()
            .should('exist')
            .and('have.text', 'See rewards');
        });
      });
      it('should have link for withdrawal page', function () {
        cy.getByTestId('home-vega-token').within(() => {
          cy.get('[href="/token/withdraw"]')
            .first()
            .should('exist')
            .and('have.text', 'Manage tokens');
        });
      });
    });
  });
});
