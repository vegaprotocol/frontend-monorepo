import { aliasGQLQuery } from '@vegaprotocol/cypress';
import { marketQuery, marketsQuery } from '@vegaprotocol/mock';

const marketId =
  marketsQuery().marketsConnection?.edges[1].node.id || 'market-1';
const marketOverride = {
  market: {
    depth: {
      lastTrade: {
        price: '9893006',
      },
    },
    id: marketId,
    tradableInstrument: {
      instrument: {
        product: {
          settlementAsset: {
            id: 'asset-id-2',
            name: 'DAI Name',
            symbol: 'tDAI',
          },
        },
      },
    },
  },
};

describe('Market trade with wallet disconnected', { tags: '@smoke' }, () => {
  before(() => {
    cy.mockConsole();
    cy.visit(`/trading/${marketId}`);
    cy.wait('@Market');
    console.log('marketId', marketId);
  });
  it('should not display steps', () => {
    cy.getByTestId('trading-connect-wallet')
      .find('h3')
      .should('have.text', 'Please connect your Vega wallet to make a trade');
    cy.getByTestId('trading-connect-wallet')
      .find('button')
      .should('have.text', 'Connect Vega wallet');
    cy.getByTestId('trading-connect-wallet')
      .find('a')
      .should('have.text', 'https://vega.xyz/wallet');
  });
});

describe('Market trade', { tags: '@regression' }, () => {
  beforeEach(() => {
    cy.mockConsole();
    cy.mockGQL((req) => {
      aliasGQLQuery(req, 'Market', marketQuery(marketOverride));
    });
    cy.setVegaWallet();
    cy.visit(`/trading/${marketId}`);
    cy.wait('@Market');
  });

  it('side selector should work well', () => {
    cy.get('#step-1-control [aria-label^="Selected value"]').should(
      'have.text',
      'Long'
    );
    cy.get('#step-1-control [aria-label^="Selected value"]').click();
    cy.get('button[aria-label="Open short position"]').click();
    cy.get('#step-2-control').click();
    cy.get('#step-1-control [aria-label^="Selected value"]').should(
      'have.text',
      'Short'
    );
  });

  it('side selector mobile view should work well', () => {
    cy.viewport('iphone-xr');
    cy.getByTestId('next-button').scrollIntoView().click();

    cy.get('button[aria-label="Open long position"]').should(
      'have.class',
      'selected'
    );
    cy.get('button[aria-label="Open short position"]').should(
      'not.have.class',
      'selected'
    );

    cy.get('button[aria-label="Open short position"]').click();
    cy.get('button[aria-label="Open long position"]').should(
      'not.have.class',
      'selected'
    );
    cy.get('button[aria-label="Open short position"]').should(
      'have.class',
      'selected'
    );
    cy.getByTestId('next-button').scrollIntoView().click();
    cy.get('#step-1-control').should(
      'contain.html',
      'aria-label="Selected value Short"'
    );
  });

  it('size slider should work well', () => {
    cy.get('#step-1-control [aria-label^="Selected value"]').click();
    cy.get('button[aria-label="Open short position"]').click();
    cy.get('#step-2-control').click();
    cy.get('#step-2-panel')
      .find('dd')
      .eq(0)
      .find('button')
      .should('have.text', '1');
    cy.get('#step-2-panel').find('[role="slider"]').type('{rightarrow}');

    cy.get('#step-2-panel')
      .find('dd')
      .eq(0)
      .find('button')
      .should('have.text', '2');
  });

  it('percentage selection should work well', () => {
    cy.get('#step-1-control [aria-label^="Selected value"]').click();
    cy.get('button[aria-label="Open short position"]').click();
    cy.get('#step-2-control').click();
    cy.get('#step-2-panel')
      .find('dd')
      .eq(0)
      .find('button')
      .should('have.text', '1');

    cy.getByTestId('max-label').should('have.text', '10');

    cy.getByTestId('percentage-selector')
      .find('button')
      .contains('Max')
      .click();
    cy.get('#step-2-panel')
      .find('dd')
      .eq(0)
      .find('button')
      .should('have.text', '10');
  });

  it('size input should work well', () => {
    cy.get('#step-1-control [aria-label^="Selected value"]').click();
    cy.get('button[aria-label="Open short position"]').click();
    cy.get('#step-2-control').click();
    cy.get('#step-2-panel')
      .find('dd')
      .eq(0)
      .find('button')
      .should('have.text', '1');
    cy.get('#step-2-panel').find('dd').eq(0).find('button').click();
    cy.get('#step-2-panel').find('dd').eq(0).find('input').type('{backspace}2');
    cy.get('#step-2-panel').find('dd').eq(0).find('button').click();
    cy.get('#step-2-panel')
      .find('dd')
      .eq(0)
      .find('button')
      .should('have.text', '2');
    cy.get('button').contains('Max').click();
  });

  it('slippage value should be displayed', () => {
    cy.get('#step-1-control [aria-label^="Selected value"]').click();
    cy.get('button[aria-label="Open short position"]').click();
    cy.get('#step-2-control').click();
    cy.get('button').contains('Max').click();
    cy.get('#step-2-panel')
      .find('dl')
      .eq(2)
      .find('dd')
      .should('have.text', '0.01%');
  });

  it('allow slippage value to be adjusted', () => {
    cy.get('#step-1-control [aria-label^="Selected value"]').click();
    cy.get('button[aria-label="Open short position"]').click();
    cy.get('#step-2-control').click();
    cy.get('button').contains('Max').click();
    cy.get('#step-2-panel')
      .find('dl')
      .eq(2)
      .find('dd')
      .should('have.text', '0.01%');
    cy.get('#step-2-panel').find('dl').eq(2).find('button').click();
    cy.get('#input-order-slippage')
      .focus()
      .type('{backspace}{backspace}{backspace}1');

    cy.getByTestId('slippage-dialog').find('button').click();

    cy.get('#step-2-panel')
      .find('dl')
      .eq(2)
      .find('dd')
      .should('have.text', '1%');
  });

  it('notional position size should be present', () => {
    cy.get('#step-1-control [aria-label^="Selected value"]').click();
    cy.get('button[aria-label="Open short position"]').click();
    cy.get('#step-2-control').click();
    cy.get('#step-2-panel')
      .find('dd')
      .eq(0)
      .find('button')
      .should('have.text', '1');
    cy.get('#step-2-panel').find('dd').eq(0).find('button').click();
    cy.get('#step-2-panel').find('dd').eq(0).find('input').type('{backspace}2');
    cy.get('#step-2-panel').find('dd').eq(0).find('button').click();
    cy.get('#step-2-panel')
      .find('dt')
      .eq(2)
      .should('have.text', 'Est. Position Size (tDAI)');
    cy.get('#step-2-panel').find('dd').eq(2).should('have.text', '197.86012');
  });

  it('total fees should be displayed', () => {
    cy.get('#step-1-control [aria-label^="Selected value"]').click();
    cy.get('button[aria-label="Open short position"]').click();
    cy.get('#step-2-control').click();
    cy.get('#step-2-panel')
      .find('dt')
      .eq(3)
      .should('have.text', 'Est. Fees (tDAI)');
    cy.get('#step-2-panel')
      .find('dd')
      .eq(3)
      .should('have.text', '3.00 (3.03%)');
  });

  it('order review should display proper calculations', () => {
    cy.get('#step-3-control').click();

    cy.getByTestId('review-trade')
      .get('#contracts_tooltip_trigger')
      .trigger('click')
      .realTouch();

    cy.get('[data-radix-popper-content-wrapper]').contains(
      'The number of contracts determines'
    );
    cy.get('#step-3-panel').find('dd').eq(1).should('have.text', '1');

    cy.get('#step-3-panel').find('dd').eq(2).should('have.text', '98.93006');

    cy.get('#step-3-panel')
      .find('dd')
      .eq(3)
      .should('have.text', '3.00 (3.03%)');

    cy.get('#step-3-panel')
      .find('dd')
      .eq(4)
      .should('have.text', '45,126.90058');

    cy.getByTestId('place-order').should('be.enabled').click();
  });

  it('info tooltip on mobile view should work well', () => {
    cy.viewport('iphone-xr');
    cy.get('#step-3-control').click();

    // Start from the bottom tooltip to ensure the tooltip above
    // can be interacted with
    cy.getByTestId('review-trade').get('div.cursor-help').eq(1).realTouch();
    cy.get('[data-radix-popper-content-wrapper]').contains(
      'The notional size represents the position size'
    );

    cy.getByTestId('review-trade')
      .get('#contracts_tooltip_trigger')
      .realTouch();
    cy.get('[data-radix-popper-content-wrapper]').contains(
      'The number of contracts determines'
    );
  });
});
