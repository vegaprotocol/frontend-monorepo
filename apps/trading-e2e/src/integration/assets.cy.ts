// #region consts
const asset = 'asset';
const assetDetailsDialog = 'dialog-content';
const assetRow = 'key-value-table-row';
const contractAddress = '7_value';
const dialogCloseBtn = 'close-asset-details-dialog';
const dialogCloseX = 'dialog-close';
const dialogTitle = 'dialog-title';

const indicesWithLabelTooltips = [4, 5, 6, 7, 8, 9, 11, 12, 13, 14];
const indicesWithValueTooltips = [1, 6];

const labelValueToolTipPairs = [
  {
    label: 'ID',
    value: 'asset-id',
  },
  {
    label: 'Type',
    value: 'ERC20',
    valueToolTip: 'An asset originated from an Ethereum ERC20 Token',
  },
  {
    label: 'Name',
    value: 'Euro',
  },
  {
    label: 'Symbol',
    value: 'tEURO',
  },
  {
    label: 'Decimals',
    value: '5',
    labelTooltip: 'Number of decimal / precision handled by this asset',
  },
  {
    label: 'Quantum',
    value: '0.00001',
    labelTooltip: 'The minimum economically meaningful amount of the asset',
  },
  {
    label: 'Status',
    value: 'Enabled',
    labelTooltip: 'The status of the asset in the Vega network',
    valueToolTip: 'Asset can be used on the Vega network',
  },
  {
    label: 'Contract address',
    value: '0x0158031158Bb4dF2AD02eAA31e8963E84EA978a4 ',
    labelTooltip:
      'The address of the contract for the token, on the ethereum network',
  },
  {
    label: 'Withdrawal threshold',
    value: '0.0005',
    labelTooltip:
      "The maximum you can withdraw instantly. There's no limit on the size of a withdrawal, but all withdrawals over the threshold will have a delay time added to them",
  },
  {
    label: 'Lifetime limit',
    value: '1,230.00',
    labelTooltip:
      'The lifetime deposit limit per address. Note: this is a temporary measure that can be changed or removed through governance',
  },
  { label: '', value: '' },
  {
    label: 'Infrastructure fee account balance',
    value: '0.00001',
    labelTooltip: 'The infrastructure fee account in this asset',
  },
  {
    label: 'Global reward pool account balance',
    value: '0.00002',
    labelTooltip: 'The global rewards acquired in this asset',
  },
  {
    label: 'Maker paid fees account balance',
    value: '0.00003',
    labelTooltip:
      'The rewards acquired based on the fees paid to makers in this asset',
  },
  {
    label: 'Maker received fees account balance',
    value: '0.00004',
    labelTooltip:
      'The rewards acquired based on fees received for being a maker on trades',
  },
  {
    label: 'Liquidity provision fee reward account balance',
    value: '0.00005',
    labelTooltip:
      'The rewards acquired based on the liquidity provision fees in this asset',
  },
  {
    label: 'Market proposer reward account balance',
    value: '0.00006',
    labelTooltip:
      'The rewards acquired based on the market proposer reward in this asset',
  },
];
//endregion

beforeEach(() => {
  cy.mockTradingPage();
  cy.mockSubscription();
  cy.setVegaWallet();
});

const visitPortfolioAndClickAsset = (assetName: string) => {
  cy.visit('/#/portfolio');
  cy.getByTestId(asset).contains(assetName).click();
};

const testTooltip = (index: number, testId: string, tooltip: string) => {
  cy.getByTestId(`${index}_${testId}`).realHover();
  cy.get('[role="tooltip"]').find('div').should('have.text', tooltip);
  cy.getByTestId(dialogTitle).click();
};

describe('assets', { tags: '@smoke', testIsolation: true }, () => {
  it('asset details', () => {
    visitPortfolioAndClickAsset('tBTC');

    cy.getByTestId(assetRow).each((element, index) => {
      if (index === 10) {
        return;
      }
      const { label, value, labelTooltip, valueToolTip } =
        labelValueToolTipPairs[index];
      // 6501-ASSE-001
      // 6501-ASSE-002
      // 6501-ASSE-003
      // 6501-ASSE-004
      // 6501-ASSE-005
      // 6501-ASSE-006
      // 6501-ASSE-007
      // 6501-ASSE-008
      // 6501-ASSE-009
      // 6501-ASSE-010
      // 6501-ASSE-011
      cy.getByTestId(`${index}_label`).should('have.text', label);
      cy.getByTestId(`${index}_value`).should('have.text', value);

      // 6501-ASSE-012
      if (indicesWithLabelTooltips.includes(index)) {
        if (labelTooltip) {
          testTooltip(index, 'label', labelTooltip);
        }
      }
      if (indicesWithValueTooltips.includes(index)) {
        if (valueToolTip) {
          testTooltip(index, 'value', valueToolTip);
        }
      }
    });
    // 6501-ASSE-013
    cy.getByTestId(dialogCloseX).click();
    cy.document().then((doc) => {
      expect(doc.querySelector(assetDetailsDialog)).to.not.exist;
    });
  });

  it('ERC20 Contract address', () => {
    visitPortfolioAndClickAsset('tBTC');
    cy.getByTestId(contractAddress).within(() => {
      // 6501-ASSE-014
      cy.getByTestId('external-link')
        .should('have.attr', 'target', '_blank')
        .should('have.text', '0x0158031158Bb4dF2AD02eAA31e8963E84EA978a4');
    });
    // 6501-ASSE-013
    cy.getByTestId(dialogCloseBtn).click();
    cy.document().then((doc) => {
      expect(doc.querySelector(assetDetailsDialog)).to.not.exist;
    });
  });
});
