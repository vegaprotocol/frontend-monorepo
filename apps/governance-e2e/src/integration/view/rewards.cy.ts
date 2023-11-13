import {
  navigateTo,
  navigation,
  verifyPageHeader,
} from '../../support/common.functions';
import { waitForBeginningOfEpoch } from '../../support/staking.functions';

// For some reason in this the below imports are typed as the jest version, importing
// them directly is an easy work around.
import { before, describe, it } from 'mocha';
import { expect } from 'chai';

const viewToggle = 'epoch-reward-view-toggle-total';
const warning = 'callout';

context(
  'Rewards Page - verify elements on page',
  { tags: '@regression' },
  function () {
    before('navigate to rewards page', function () {
      cy.visit('/');
      navigateTo(navigation.rewards);
    });

    describe('with wallets disconnected', function () {
      it('should have REWARDS tab highlighted', function () {
        verifyPageHeader('Rewards and fees');
      });

      it('should have rewards header visible', function () {
        verifyPageHeader('Rewards and fees');
      });

      it('should have epoch warning', function () {
        cy.getByTestId(warning)
          .should('be.visible')
          .and(
            'have.text',
            'Rewards are credited less than a minute after the epoch ends.This delay is set by a network parameter'
          );
      });

      it('should have toggle for seeing total vs individual rewards', function () {
        cy.getByTestId(viewToggle).should('be.visible');
      });

      // Skipping due to bug #3471 causing flaky failuress
      it.skip('should have option to view go to next and previous page', function () {
        waitForBeginningOfEpoch();
        cy.getByTestId('page-info')
          .should('contain.text', 'Page ')
          .invoke('text')
          .then(($currentPage) => {
            const currentPageNumber = Number($currentPage.slice(5));
            cy.getByTestId('goto-next-page').click();
            cy.getByTestId('page-info')
              .invoke('text')
              .then(($newPageNumber) => {
                const newPageNumber = Number($newPageNumber.slice(5));
                expect(newPageNumber).to.be.greaterThan(currentPageNumber);
                cy.getByTestId('goto-previous-page').click();
                cy.getByTestId('page-info').should(
                  'contain.text',
                  $currentPage
                );
              });
          });
      });

      it('should have option to go to last and newest page', function () {
        cy.getByTestId('goto-last-page').click();
        cy.getByTestId('epoch-total-rewards-table')
          .last()
          .find('h2')
          .first()
          .should('have.text', 'EPOCH 1');
        cy.getByTestId('goto-first-page').click();
        cy.get('h2').should('not.contain.text', 'EPOCH 1');
      });
    });
  }
);
