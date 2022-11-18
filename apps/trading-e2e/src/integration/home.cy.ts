import { aliasQuery } from '@vegaprotocol/cypress';
import type { ProposalListFieldsFragment } from '@vegaprotocol/governance';
import { Schema } from '@vegaprotocol/types';

const selectMarketOverlay = 'select-market-list';

const generateProposal = (code: string): ProposalListFieldsFragment => ({
  __typename: 'Proposal',
  reference: '',
  state: Schema.ProposalState.STATE_OPEN,
  datetime: '',
  votes: {
    __typename: undefined,
    yes: {
      __typename: undefined,
      totalTokens: '',
      totalNumber: '',
      totalWeight: '',
    },
    no: {
      __typename: undefined,
      totalTokens: '',
      totalNumber: '',
      totalWeight: '',
    },
  },
  terms: {
    __typename: 'ProposalTerms',
    closingDatetime: '',
    enactmentDatetime: undefined,
    change: {
      __typename: 'NewMarket',
      instrument: {
        __typename: 'InstrumentConfiguration',
        code: code,
        name: code,
        futureProduct: {
          __typename: 'FutureProduct',
          settlementAsset: {
            __typename: 'Asset',
            id: 'A',
            name: 'A',
            symbol: 'A',
          },
        },
      },
    },
  },
});

describe('home', { tags: '@regression' }, () => {
  beforeEach(() => {
    cy.mockTradingPage();
    cy.mockGQLSubscription();
    cy.visit('/');
  });

  describe('default market found', () => {
    it('redirects to a default market with the landing dialog open', () => {
      cy.visit('/');
      cy.wait('@Market');

      cy.get('main', { timeout: 20000 }).then((el) => {
        expect(el.attr('data-testid')?.startsWith('/market')).to.equal(true);
      }); // Wait for page to be rendered to before checking url

      // Overlay should be shown
      cy.getByTestId(selectMarketOverlay).should('exist');
      cy.contains('Select a market to get started').should('be.visible');

      // I expect the market overlay table to contain at least 3 rows (one header row)
      cy.getByTestId(selectMarketOverlay)
        .get('table tr')
        .then((row) => {
          expect(row.length >= 3).to.be.true;
        });

      // each market shown in overlay table contains content under the last price and change fields
      cy.getByTestId(selectMarketOverlay)
        .get('table tr')
        .each(($element, index) => {
          if (index > 0) {
            // skip header row
            cy.root().within(() => {
              cy.getByTestId('price').should('not.be.empty');
            });
          }
        });

      cy.getByTestId('dialog-close').click();
      cy.getByTestId(selectMarketOverlay).should('not.exist');

      // the choose market overlay is no longer showing
      cy.contains('Select a market to get started').should('not.exist');
      cy.contains('Loading...').should('not.exist');
      cy.url().should('eq', Cypress.config().baseUrl + '/#/markets/market-0');
    });
  });

  describe('no markets found', () => {
    it('redirects to a the empty market page and displays welcome notice', () => {
      cy.mockGQL((req) => {
        const data = {
          marketsConnection: {
            __typename: 'MarketConnection',
            edges: [],
          },
        };
        const proposalA: ProposalListFieldsFragment =
          generateProposal('AAAZZZ');

        aliasQuery(req, 'Markets', data);
        aliasQuery(req, 'MarketsData', data);
        aliasQuery(req, 'ProposalsList', {
          proposalsConnection: {
            __typename: 'ProposalsConnection',
            edges: [{ __typename: 'ProposalEdge', node: proposalA }],
          },
        });
      });
      cy.visit('/');
      cy.wait('@Markets');
      cy.wait('@MarketsData');
      cy.url().should('eq', Cypress.config().baseUrl + `/#/markets/empty`);
      cy.getByTestId('welcome-notice-title').should(
        'contain.text',
        'Welcome to Console'
      );
      cy.getByTestId('welcome-notice-proposed-markets').should(
        'contain.text',
        'AAAZZZ'
      );
    });
  });
});
