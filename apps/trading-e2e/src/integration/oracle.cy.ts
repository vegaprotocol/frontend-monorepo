import { MarketState } from '@vegaprotocol/types';

const oracleBannerDialogTrigger = 'oracle-banner-dialog-trigger';
const oracleBannerStatus = 'oracle-banner-status';
const oracleFullProfile = 'oracle-full-profile';

describe('oracle information', { tags: '@smoke' }, () => {
  before(() => {
    cy.setOnBoardingViewed();
    cy.mockTradingPage(
      MarketState.STATE_ACTIVE,
      undefined,
      undefined,
      'COMPROMISED'
    );
    cy.mockSubscription();
    cy.visit('/#/markets/market-0');
    cy.wait('@Markets');
  });

  it('show oracle banner', () => {
    cy.getByTestId(oracleBannerStatus).should('contain.text', 'COMPROMISED');
    cy.getByTestId(oracleBannerDialogTrigger)
      .should('contain.text', 'Show more')
      .click();
    cy.getByTestId(oracleFullProfile).should('exist');
  });
});
