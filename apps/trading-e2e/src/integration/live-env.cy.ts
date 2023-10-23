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
const marketListContent = 'popover-content';

describe(
  'Console - market info - live env',
  { tags: '@live', testIsolation: true },
  () => {
    before(() => {
      cy.visit('/');
      cy.contains('Loading market data...').should('not.exist');
      cy.getByTestId('link').should('be.visible');
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
      'Price monitoring bounds 1',
      'Liquidity monitoring parameters',
      'Liquidity',
      'Liquidity price range',
      'Oracle',
      'Proposal',
    ];

    it('market info titles are displayed', () => {
      cy.getByTestId('split-view-view')
        .find('.text-lg')
        .each((element, index) => {
          cy.wrap(element).should('have.text', titles[index]);
        });
    });

    it('market info subtitles are displayed', () => {
      cy.getByTestId('popover-trigger').click();
      cy.contains('Loading market data...').should('not.exist');
      cy.contains('[data-testid="link"]', 'AAVEDAI.MF21').click();
      cy.getByTestId(marketInfoBtn).click();
      cy.getByTestId(marketInfoSubtitle).each((element, index) => {
        cy.wrap(element).should('have.text', subtitles[index]);
      });
    });

    it('renders correctly liquidity in trading tab', () => {
      cy.getByTestId('Liquidity').click();
      cy.contains('Loading').should('not.exist');
      cy.contains('Something went wrong').should('not.exist');
      cy.contains('Application error').should('not.exist');
      cy.getByTestId('tab-liquidity').within(() => {
        cy.get('[col-id="partyId"]').eq(1).should('not.be.empty');
      });
    });
  }
);

describe(
  'Console - market summary - live env',
  { tags: '@live', testIsolation: true },
  () => {
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
  }
);

describe(
  'Console - markets table - live env',
  { tags: '@live', testIsolation: true },
  () => {
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
      cy.getByTestId(marketListContent)
        .find('[data-testid="price"]')
        .invoke('text')
        .should('not.be.empty');
      cy.getByTestId(marketListContent)
        .find('[data-testid="trading-mode-col"]')
        .should('not.be.empty');
      cy.getByTestId(marketListContent)
        .find('[data-testid="taker-fee"]')
        .should('contain.text', '%');
      cy.getByTestId(marketListContent)
        .find('[data-testid="market-volume"]')
        .should('not.be.empty');
      cy.getByTestId(marketListContent)
        .find('[data-testid="market-name"]')
        .should('not.be.empty');
    });

    it('Able to select market from dropdown', () => {
      cy.getByTestId('popover-trigger')
        .invoke('text')
        .then((marketName) => {
          openMarketDropDown();
          cy.get('[data-testid^=market-link]').eq(1).click();
          cy.getByTestId('popover-trigger').should('not.be.equal', marketName);
        });
    });
  }
);

function openMarketDropDown() {
  cy.contains('Loading...').should('not.exist');
  cy.getByTestId('link').should('be.visible');
  cy.getByTestId('dialog-close').click();
  cy.getByTestId('popover-trigger').click();
  cy.contains('Loading market data...').should('not.exist');
}
