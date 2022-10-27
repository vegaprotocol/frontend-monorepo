const selectMarketOverlay = 'select-market-list';
const marketInfoBtn = 'Info';
const marketInfoSubtitle = 'accordion-title';
const marketSummaryBlock = 'header-summary';
const marketExpiry = 'market-expiry';
const marketPrice = 'market-price';
const marketChange = 'market-change';
const marketVolume = 'market-volume';
const marketMode = 'market-trading-mode';
const marketSettlement = 'market-settlement-asset';
const percentageValue = 'price-change-percentage';
const priceChangeValue = 'price-change';
const itemHeader = 'item-header';
const itemValue = 'item-value';

describe('Console - market list - live env', { tags: '@live' }, () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('shows the market list page', () => {
    cy.get('main[data-testid="market"]', { timeout: 20000 }).should('exist'); // Wait for page to be rendered to before checking url

    // Overlay should be shown
    cy.getByTestId(selectMarketOverlay).should('exist');
    cy.contains('Select a market to get started').should('be.visible');

    // I expect the market overlay table to contain at least one row
    cy.getByTestId(selectMarketOverlay)
      .get('table tr')
      .should('have.length.greaterThan', 1);

    // each market shown in overlay table contains content under the last price and change fields
    cy.getByTestId(selectMarketOverlay)
      .get('table tr')
      .getByTestId('price')
      .should('not.be.empty');
  });

  it('redirects to a default market', () => {
    cy.getByTestId('dialog-close').click();
    cy.getByTestId(selectMarketOverlay).should('not.exist');

    // the choose market overlay is no longer showing
    cy.contains('Select a market to get started').should('not.exist');
    cy.contains('Loading...').should('not.exist');
    cy.getByTestId('popover-trigger').should('not.be.empty');
  });
});

describe('Console - market info - live env', { tags: '@live' }, () => {
  before(() => {
    cy.visit('/');
    cy.getByTestId('dialog-close').click();
    cy.getByTestId(marketInfoBtn).click();
  });
  const titles = ['Market data', 'Market specification', 'Market governance'];
  const subtitles = [
    'Current fees',
    'Market price',
    'Market volume',
    'Insurance pool',
    'Key details',
    'Instrument',
    'Settlement asset',
    'Metadata',
    'Risk model',
    'Risk parameters',
    'Risk factors',
    'Price monitoring trigger 1',
    'Price monitoring bound 1',
    'Liquidity monitoring parameters',
    'Liquidity',
    'Oracle',
    'Proposal',
  ];

  it('market info titles are displayed', () => {
    cy.get('.text-lg').each((element, index) => {
      cy.wrap(element).should('have.text', titles[index]);
    });
  });

  it('market info subtitles are displayed', () => {
    cy.getByTestId(marketInfoSubtitle).each((element, index) => {
      cy.wrap(element).should('have.text', subtitles[index]);
    });
  });
});

describe('Console - market summary - live env', { tags: '@live' }, () => {
  before(() => {
    cy.visit('/');
    cy.getByTestId('dialog-close').click();
    cy.getByTestId(marketSummaryBlock).should('be.visible');
  });
  it('must display market name', () => {
    cy.getByTestId('popover-trigger').should('not.be.empty');
  });

  it('must see market expiry', () => {
    cy.getByTestId(marketSummaryBlock).within(() => {
      cy.getByTestId(marketExpiry).within(() => {
        cy.getByTestId(itemHeader).should('have.text', 'Expiry');
        cy.getByTestId(itemValue).should('not.be.empty');
      });
    });
  });

  it('must see market price', () => {
    cy.getByTestId(marketSummaryBlock).within(() => {
      cy.getByTestId(marketPrice).within(() => {
        cy.getByTestId(itemHeader).should('have.text', 'Price');
        cy.getByTestId(itemValue).should('not.be.empty');
      });
    });
  });

  it('must see market change', () => {
    cy.getByTestId(marketSummaryBlock).within(() => {
      cy.getByTestId(marketChange).within(() => {
        cy.getByTestId(itemHeader).should('have.text', 'Change (24h)');
        cy.getByTestId(percentageValue).should('not.be.empty');
        cy.getByTestId(priceChangeValue).should('not.be.empty');
      });
    });
  });

  it('must see market volume', () => {
    cy.getByTestId(marketSummaryBlock).within(() => {
      cy.getByTestId(marketVolume).within(() => {
        cy.getByTestId(itemHeader).should('have.text', 'Volume (24h)');
        cy.getByTestId(itemValue).should('not.be.empty');
      });
    });
  });

  it('must see market mode', () => {
    cy.getByTestId(marketSummaryBlock).within(() => {
      cy.getByTestId(marketMode).within(() => {
        cy.getByTestId(itemHeader).should('have.text', 'Trading mode');
        cy.getByTestId(itemValue).should('not.be.empty');
      });
    });
  });

  it('must see market settlement', () => {
    cy.getByTestId(marketSummaryBlock).within(() => {
      cy.getByTestId(marketSettlement).within(() => {
        cy.getByTestId(itemHeader).should('have.text', 'Settlement asset');
        cy.getByTestId(itemValue).should('not.be.empty');
      });
    });
  });
});

describe('Console - markets table - live env', { tags: '@live' }, () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('renders markets correctly', () => {
    cy.get('[data-testid^="market-link-"]').should('not.be.empty');
    cy.getByTestId('price').invoke('text').should('not.be.empty');
    cy.getByTestId('settlement-asset').should('not.be.empty');
    cy.getByTestId('price-change-percentage').should('not.be.empty');
    cy.getByTestId('price-change').should('not.be.empty');
    cy.getByTestId('sparkline-svg').should('be.visible');
  });

  it('renders market list drop down', () => {
    openMarketDropDown();
    cy.getByTestId('price').invoke('text').should('not.be.empty');
    cy.getByTestId('trading-mode-col').should('not.be.empty');
    cy.getByTestId('taker-fee').should('contain.text', '%');
    cy.getByTestId('market-volume').should('not.be.empty');
    cy.getByTestId('market-name').should('not.be.empty');
  });

  it('Able to select market from dropdown', () => {
    cy.getByTestId('popover-trigger')
      .invoke('text')
      .then((marketName) => {
        openMarketDropDown();
        cy.get('[data-testid^=market-link').eq(1).click();
        cy.getByTestId('popover-trigger').should('not.be.equal', marketName);
      });
  });
});

function openMarketDropDown() {
  cy.getByTestId('dialog-close').click();
  cy.getByTestId('popover-trigger').click();
  cy.contains('Loading market data...').should('not.exist');
}
