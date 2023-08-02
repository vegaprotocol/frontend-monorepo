import { aliasGQLQuery } from '@vegaprotocol/cypress';
import type { ProposalListFieldsFragment } from '@vegaprotocol/proposals';
import * as Schema from '@vegaprotocol/types';

const dialogContent = 'welcome-dialog';

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
  requiredMajority: '',
  party: {
    __typename: 'Party',
    id: '',
  },
  rationale: {
    __typename: 'ProposalRationale',
    description: '',
    title: '',
  },
  requiredParticipation: '',
  errorDetails: '',
  rejectionReason: null,
  requiredLpMajority: '',
  requiredLpParticipation: '',
  terms: {
    __typename: 'ProposalTerms',
    closingDatetime: '',
    enactmentDatetime: undefined,
    change: {
      __typename: 'NewMarket',
      decimalPlaces: 1,
      lpPriceRange: '',
      riskParameters: {
        __typename: 'SimpleRiskModel',
        params: {
          __typename: 'SimpleRiskModelParams',
          factorLong: 0,
          factorShort: 1,
        },
      },
      metadata: [],
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
            decimals: 1,
            quantum: '',
          },
          quoteName: '',
          dataSourceSpecBinding: {
            __typename: 'DataSourceSpecToFutureBinding',
            settlementDataProperty: '',
            tradingTerminationProperty: '',
          },
          dataSourceSpecForSettlementData: {
            __typename: 'DataSourceDefinition',
            sourceType: {
              __typename: 'DataSourceDefinitionInternal',
            },
          },
          dataSourceSpecForTradingTermination: {
            __typename: 'DataSourceDefinition',
            sourceType: {
              __typename: 'DataSourceDefinitionInternal',
            },
          },
        },
      },
    },
  },
});

describe('home', { tags: '@regression' }, () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.mockTradingPage();
    cy.mockSubscription();
  });

  describe('default market found', () => {
    it('redirects to a default market with the landing dialog open', () => {
      cy.visit('/');
      cy.wait('@Markets');

      cy.get('[data-testid^="pathname-/markets/"]');

      // the choose market overlay is no longer showing
      cy.contains('Loading...').should('not.exist');
      cy.url().should('eq', Cypress.config().baseUrl + '/#/markets/market-0');
    });
  });

  describe('no markets found', () => {
    beforeEach(() => {
      cy.mockGQL((req) => {
        const data = {
          marketsConnection: {
            __typename: 'MarketConnection',
            edges: [],
          },
        };
        const proposalA: ProposalListFieldsFragment =
          generateProposal('AAAZZZ');

        aliasGQLQuery(req, 'Markets', data);
        aliasGQLQuery(req, 'MarketsData', data);
        aliasGQLQuery(req, 'ProposalsList', {
          proposalsConnection: {
            __typename: 'ProposalsConnection',
            edges: [{ __typename: 'ProposalEdge', node: proposalA }],
          },
        });
      });
      cy.visit('/');
      cy.wait('@Markets');
      cy.wait('@MarketsData');
    });

    it('close welcome dialog should redirect to market/all', () => {
      cy.url().should('eq', Cypress.config().baseUrl + `/#/markets/all`);
      cy.getByTestId('welcome-dialog').should('be.visible');
      cy.getByTestId('welcome-title').should('contain.text', 'Console CUSTOM');
      cy.getByTestId('browse-markets-button').should('not.be.disabled');
      cy.getByTestId('get-started-banner').should('be.visible');
      cy.getByTestId('get-started-button').should('not.be.disabled');
      cy.getByTestId('dialog-close').click();
      cy.url().should('eq', Cypress.config().baseUrl + `/#/markets/all`);
      cy.window().then((window) => {
        expect(window.localStorage.getItem('vega_onboarding_viewed')).to.equal(
          'true'
        );
      });
    });

    it('click browse markets button should redirect to market/all', () => {
      cy.getByTestId('welcome-dialog').should('be.visible');
      cy.getByTestId('browse-markets-button').click();
      cy.url().should('eq', Cypress.config().baseUrl + `/#/markets/all`);
      cy.window().then((window) => {
        expect(window.localStorage.getItem('vega_onboarding_viewed')).to.equal(
          'true'
        );
      });
    });

    it('click get started button should open connect dialog', () => {
      cy.getByTestId('welcome-dialog').should('be.visible');
      cy.getByTestId('get-started-button').click();
      cy.url().should('eq', Cypress.config().baseUrl + `/#/markets/all`);
      cy.window().then((window) => {
        expect(window.localStorage.getItem('vega_onboarding_viewed')).to.equal(
          'true'
        );
      });
      cy.getByTestId('wallet-dialog-title').should('contain.text', 'Connect');
    });
  });

  describe('redirect should take last visited market into consideration', () => {
    it('marketId comes from existing market', () => {
      cy.window().then((window) => {
        window.localStorage.setItem('marketId', 'market-1');
        cy.visit('/');
        cy.getByTestId('dialog-close').click();
        cy.location('hash').should('equal', '#/markets/market-1');
        cy.getByTestId(dialogContent).should('not.exist');
      });
    });

    it('marketId comes from not-existing market', () => {
      cy.window().then((window) => {
        window.localStorage.setItem('marketId', 'market-not-existing');
        cy.mockGQL((req) => {
          aliasGQLQuery(req, 'Market', null);
        });
        cy.visit('/');
        cy.wait('@Markets');
        cy.getByTestId('dialog-close').click();
        cy.location('hash').should('equal', '#/markets/market-not-existing');
        cy.getByTestId(dialogContent).should('not.exist');
      });
    });
  });
});
