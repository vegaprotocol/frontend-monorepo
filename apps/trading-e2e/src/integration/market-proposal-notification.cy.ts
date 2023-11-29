import { aliasGQLQuery } from '@vegaprotocol/cypress';
import { proposalListQuery, marketUpdateProposal } from '@vegaprotocol/mock';
import * as Schema from '@vegaprotocol/types';

describe('Market proposal notification', { tags: '@smoke' }, () => {
  before(() => {
    cy.setVegaWallet();
    cy.mockTradingPage(
      Schema.MarketState.STATE_ACTIVE,
      Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
      Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET
    );
    cy.mockGQL((req) => {
      aliasGQLQuery(
        req,
        'ProposalsList',
        proposalListQuery({
          proposalsConnection: {
            edges: [{ node: marketUpdateProposal }],
          },
        })
      );
    });
    cy.mockSubscription();
    cy.visit('/#/markets/market-0');
    cy.getByTestId('Info').click();
    cy.wait('@MarketData');
    cy.getByTestId('sidebar-content').should('be.visible');
  });

  it('should display market proposal notification if proposal found', () => {
    cy.getByTestId('sidebar-content').within(() => {
      cy.getByTestId('market-proposal-notification').should(
        'contain.text',
        'Changes have been proposed for this market'
      );
      cy.getByTestId('market-proposal-notification').within(() => {
        cy.getByTestId('external-link').should(
          'have.attr',
          'href',
          `${Cypress.env('VEGA_TOKEN_URL')}/proposals/123`
        );
      });
    });
  });
});
