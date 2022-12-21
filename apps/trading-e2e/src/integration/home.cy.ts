import { aliasQuery } from '@vegaprotocol/cypress';
import type { ProposalListFieldsFragment } from '@vegaprotocol/governance';
import * as Schema from '@vegaprotocol/types';
import { generateMarketsData } from '../support/mocks/generate-markets';

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

      cy.getByTestId('welcome-notice-proposed-markets')
        .children('div.pt-1.flex.justify-between')
        .should('have.length', 3)
        .each((item) => {
          cy.wrap(item).getByTestId('external-link').should('exist');
        });

      cy.getByTestId('dialog-close').click();
      cy.getByTestId(selectMarketOverlay).should('not.exist');

      // the choose market overlay is no longer showing
      cy.contains('Select a market to get started').should('not.exist');
      cy.contains('Loading...').should('not.exist');
      cy.url().should('eq', Cypress.config().baseUrl + '/#/markets/market-0');
    });
  });

  describe('market table should be properly rendered', () => {
    it('redirects to a default market with the landing dialog open', () => {
      const override = {
        marketsConnection: {
          edges: [
            {
              node: {
                data: {
                  markPrice: '46126900581221212121212121212121212121212121212',
                },
              },
            },
          ],
        },
      };
      const data = generateMarketsData(override);
      cy.mockGQL((req) => {
        aliasQuery(req, 'MarketsData', data);
      });
      cy.visit('/');
      cy.wait('@Market');
      cy.getByTestId(selectMarketOverlay)
        .get('table')
        .invoke('outerWidth')
        .then((value) => {
          expect(value).to.be.closeTo(554, 10);
        });
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
      cy.url().should('eq', Cypress.config().baseUrl + `/#/markets`);
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

  describe('no proposal found', () => {
    it('there is a link to propose market', () => {
      cy.mockGQL((req) => {
        aliasQuery(req, 'ProposalsList', {
          proposalsConnection: {
            __typename: 'ProposalsConnection',
            edges: null,
          },
        });
      });
      cy.visit('/');
      cy.wait('@Markets');
      cy.wait('@MarketsData');
      cy.getByTestId(selectMarketOverlay)
        .get('table tr')
        .then((row) => {
          expect(row.length >= 3).to.be.true;
        });
      cy.getByTestId('external-link')
        .contains('Propose a market')
        .should('exist');
    });
  });

  describe('no proposal nor markets found', () => {
    it('there are welcome text and a link to propose market', () => {
      cy.mockGQL((req) => {
        const data = {
          marketsConnection: {
            __typename: 'MarketConnection',
            edges: [],
          },
        };
        aliasQuery(req, 'Markets', data);
        aliasQuery(req, 'MarketsData', data);
        aliasQuery(req, 'ProposalsList', {
          proposalsConnection: {
            __typename: 'ProposalsConnection',
            edges: null,
          },
        });
      });
      cy.visit('/');
      cy.wait('@Markets');
      cy.wait('@MarketsData');
      cy.getByTestId('welcome-notice-title').should(
        'contain.text',
        'Welcome to Console'
      );
      cy.getByTestId('external-link')
        .contains('Propose a market')
        .should('exist');
    });
  });
});
