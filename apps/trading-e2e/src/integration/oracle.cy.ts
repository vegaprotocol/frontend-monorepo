import { MarketState } from '@vegaprotocol/types';

const oracleBannerStatus = 'oracle-banner-status';
const oracleBannerDialogTrigger = 'oracle-banner-dialog-trigger';
const oracleFullProfile = 'oracle-full-profile';

describe('oracle information', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.mockTradingPage();
  });

  before(() => {
    cy.mockTradingPage(
      MarketState.STATE_ACTIVE,
      undefined,
      undefined,
      'COMPROMISED'
    );
    cy.mockSubscription();
    cy.visit('/#/markets/market-0');
    cy.wait('@Markets');
    cy.wait('@MarketInfo');
  });

  it('show oracle banner', () => {
    cy.getByTestId(oracleBannerStatus).should('contain.text', 'COMPROMISED');
    cy.getByTestId(oracleBannerDialogTrigger)
      .should('contain.text', 'Show more')
      .click();
    cy.getByTestId(oracleFullProfile).should('exist');
  });
});
