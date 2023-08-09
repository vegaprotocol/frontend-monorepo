const orderbookTab = 'Orderbook';
const orderbookTable = 'tab-orderbook';
const askPrice = 'price-9894185';
const bidPrice = 'price-9889001';
const askVolume = 'ask-vol-9894185';
const bidVolume = 'bid-vol-9889001';
const askCumulative = 'cumulative-vol-9894185';
const bidCumulative = 'cumulative-vol-9889001';
const midPrice = 'middle-mark-price-4612690000';
const priceResolution = 'resolution';
const dealTicketPrice = 'order-price';
const dealTicketSize = 'order-size';
const resPrice = 'price-990';

describe('order book', { tags: '@smoke' }, () => {
  before(() => {
    cy.setOnBoardingViewed();
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.visit('/#/markets/market-0');
    cy.wait('@Markets');
  });

  beforeEach(() => {
    cy.mockTradingPage();
  });

  it('show order book', () => {
    // 6003-ORDB-001
    // 6003-ORDB-002
    cy.getByTestId(orderbookTab).click();
    cy.getByTestId(orderbookTable).should('be.visible');
    cy.getByTestId(orderbookTable).should('not.be.empty');
  });

  it('show orders prices', () => {
    // 6003-ORDB-003
    cy.getByTestId(askPrice).should('have.text', '98.94185');
    cy.getByTestId(bidPrice).should('have.text', '98.89001');
  });

  it('show prices volumes', () => {
    // 6003-ORDB-004
    cy.getByTestId(askVolume).should('have.text', '1');
    cy.getByTestId(bidVolume).should('have.text', '1');
  });

  it('show prices cumulative volumes', () => {
    // 6003-ORDB-005
    cy.getByTestId(askCumulative).should('have.text', '38');
    cy.getByTestId(bidCumulative).should('have.text', '7');
  });

  it('show mid price', () => {
    // 6003-ORDB-006
    cy.getByTestId(midPrice).should('have.text', '46,126.90');
  });

  it('sort prices descending', () => {
    // 6003-ORDB-007
    const prices: number[] = [];
    cy.getByTestId(orderbookTable).within(() => {
      cy.get('[data-testid*=price]')
        .each(($el) => {
          prices.push(Number($el.text()));
        })
        .then(() => {
          expect(prices).to.deep.equal(prices.sort((a, b) => b - a));
        });
    });
  });

  it('copy price to deal ticket form', () => {
    // 6003-ORDB-009
    cy.getByTestId(askPrice).click();
    cy.getByTestId(dealTicketPrice).should('have.value', '98.94185');
  });

  it('copy size to deal ticket form', () => {
    // 6003-ORDB-009
    cy.getByTestId(bidCumulative).click();
    cy.getByTestId(dealTicketSize).should('have.value', '7');
  });

  it('copy size to deal ticket form', () => {
    // 6003-ORDB-009
    cy.getByTestId(bidVolume).click();
    cy.getByTestId(dealTicketSize).should('have.value', '1');
  });

  it('change price resolution', () => {
    // 6003-ORDB-008
    const resolutions = [
      '0.00000',
      '0.0000',
      '0.000',
      '0.00',
      '0.0',
      '0',
      '10',
      '100',
      '1,000',
      '10,000',
    ];
    cy.getByTestId(priceResolution).click();
    cy.get('[role="menu"]')
      .find('[role="menuitem"]')
      .each(($el, index) => {
        expect($el.text()).to.equal(resolutions[index]);
      });

    cy.get('[role="menuitem"]').eq(4).click();
    cy.getByTestId(resPrice).should('have.text', '99.0');
    cy.getByTestId(askPrice).should('not.exist');
    cy.getByTestId(bidPrice).should('not.exist');
  });
});
