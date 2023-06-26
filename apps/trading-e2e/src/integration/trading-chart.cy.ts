import { getDateTimeFormat } from '@vegaprotocol/utils';

interface ItemInfoType {
  name: string;
  infoText: string;
}

type CheckMenuItemsFnType = (
  triggerSelector: string,
  validTexts: string[],
  clickItem?: string
) => void;
type CheckMenuItemCheckboxFnType = (
  buttonText: string,
  items: ItemInfoType[]
) => void;

const menuItemRadio = 'div[role="menuitemradio"]';
const menuItemCheckbox = 'div[role="menuitemcheckbox"]';
const button = 'button';
const indicatorInfo = '.indicator-info-wrapper';

const checkMenuItems: CheckMenuItemsFnType = (
  triggerSelector,
  validTexts,
  clickItem
) => {
  cy.get(triggerSelector).click();

  cy.get(menuItemRadio)
    .should('have.length', validTexts.length)
    .each(($el, index) => {
      const text = $el.text().trim();
      expect(text).to.equal(validTexts[index]);
    });

  if (clickItem) {
    cy.contains(menuItemRadio, clickItem).click();
    cy.get(triggerSelector).click();
    cy.get(`${menuItemRadio}[data-state="checked"]`)
      .invoke('text')
      .then((text: string) => {
        expect(text.trim()).to.equal(clickItem);
      });
  }
};

const checkMenuItemCheckbox: CheckMenuItemCheckboxFnType = (
  buttonText,
  items
) => {
  items.forEach((item) => {
    cy.contains(button, buttonText).click();
    cy.contains(menuItemCheckbox, item.name).click();
  });

  cy.contains(button, buttonText).click();
  cy.get(menuItemCheckbox)
    .should('have.length', items.length)
    .each(($el, index) => {
      const text = $el.text();
      expect(text).to.equal(items[index].name);
    });

  items.forEach((item, index) => {
    cy.get(indicatorInfo)
      .eq(index + 1)
      .invoke('text')
      .should('eq', item.infoText);
  });

  cy.contains(button, buttonText).click({ force: true });
};

function getButtonSelectorByText(text: string): string {
  return `${button}[aria-haspopup="menu"]:contains(${text})`;
}

beforeEach(() => {
  cy.mockTradingPage();
  cy.mockSubscription();
  cy.visit('/#/markets/market-0');
  cy.wait('@Markets');
});

describe(
  'chart display options',
  { tags: '@smoke', testIsolation: true },
  () => {
    it('change time interval', () => {
      // 6004-CHAR-001
      checkMenuItems(
        getButtonSelectorByText('Interval:'),
        ['1m', '5m', '15m', '1H', '6H', '1D'],
        '1m'
      );
    });

    it('change display type', () => {
      // 6004-CHAR-002
      // 6004-CHAR-003
      checkMenuItems(
        '[aria-label$="chart icon"]',
        ['Mountain', 'Candlestick', 'Line', 'OHLC'],
        'Mountain'
      );
    });

    it('Overlays', () => {
      // 6004-CHAR-004
      // 6004-CHAR-008
      // 6004-CHAR-009
      // 6004-CHAR-034
      // 6004-CHAR-037
      // 6004-CHAR-039
      // 6004-CHAR-041

      const overlayInfo: ItemInfoType[] = [
        {
          name: 'Bollinger bands',
          infoText: 'Bollinger: Upper 174.78590Lower 173.38014',
        },
        {
          name: 'Envelope',
          infoText: 'Envelope: Upper 191.29000Lower 156.51000',
        },
        { name: 'EMA', infoText: 'EMA: 174.06793' },
        { name: 'Moving average', infoText: 'Moving average: 174.08302' },
        {
          name: 'Price monitoring bounds',
          infoText: 'Price Monitoring Bounds: Min -Max -Reference -',
        },
      ];

      checkMenuItemCheckbox('Overlays', overlayInfo);
    });

    it('Studies', () => {
      // 6004-CHAR-005
      // 6004-CHAR-006
      // 6004-CHAR-007
      // 6004-CHAR-042
      // 6004-CHAR-045
      // 6004-CHAR-047
      // 6004-CHAR-049
      // 6004-CHAR-051
      const studyInfo: ItemInfoType[] = [
        {
          name: 'Eldar-ray',
          infoText: 'Eldar-ray: Bull -0.08376Bear -0.58376',
        },
        { name: 'Force index', infoText: 'Force index: 987.48858' },
        { name: 'MACD', infoText: 'MACD: S -0.06420D 0.00359MACD -0.06062' },
        { name: 'RSI', infoText: 'RSI: 47.08648' },
        { name: 'Volume', infoText: 'Volume: 55,000.00000' },
      ];
      cy.get(indicatorInfo).eq(1).realHover();
      cy.get('.close-button-module_closeButton__2ifkl').click({ force: true });
      cy.get(indicatorInfo).should('have.length', 1);

      checkMenuItemCheckbox('Studies', studyInfo);
    });

    it('price details', () => {
      // 6004-CHAR-010
      const now = new Date(Date.parse('11:30 2022-04-06')).getTime();
      cy.clock(now, ['Date']);
      cy.reload();
      const expectedDate = getDateTimeFormat().format(
        new Date('11:30 2022-04-06')
      );
      const expectedOhlc = `O 173.60000H 174.00000L 173.50000C 173.90000Change −0.60000(−0.34%)`;
      cy.get(indicatorInfo)
        .eq(0)
        .invoke('text')
        .then((text) => {
          const actualDate = getDateTimeFormat().format(
            new Date(text.slice(0, -67))
          );
          const actualOhlc = text.slice(-67);
          assert.equal(actualDate + actualOhlc, expectedDate + expectedOhlc);
        });
      cy.clock().then((clock) => {
        clock.restore();
      });
    });
  }
);
