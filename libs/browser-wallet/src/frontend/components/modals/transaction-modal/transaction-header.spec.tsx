import { render, screen } from '@testing-library/react';

import { locators as subheaderLocators } from '@/components/sub-header';

import { TransactionHeader } from './transaction-header';

jest.mock('../../keys/vega-key', () => ({
  VegaKey: () => <div data-testid="vega-key" />,
}));

const transaction = {
  orderSubmission: {
    marketId:
      '10c7d40afd910eeac0c2cad186d79cb194090d5d5f13bd31e14c49fd1bded7e2',
    price: '0',
    size: '64',
    side: 'SIDE_SELL',
    timeInForce: 'TIME_IN_FORCE_GTT',
    expiresAt: '1678959957494396062',
    type: 'TYPE_LIMIT',
    reference: 'traderbot',
    peggedOrder: {
      reference: 'PEGGED_REFERENCE_BEST_ASK',
      offset: '15',
    },
  },
};

describe('TransactionHeader', () => {
  it('renders page header, transaction type, hostname and key', () => {
    /* 1105-TRAN-011 For transactions that are not orders or withdraw / transfers, there is a standard template with the minimum information required i.e. 
        -- [ ] Transaction title
        -- [ ] Where it is from e.g. console.vega.xyz with a favicon
        -- [ ] The key you are using to sign with a visual identifier
        */
    render(
      <TransactionHeader
        transaction={transaction as any}
        name="Key 1"
        receivedAt="0"
      />
    );
    const subheaders = screen.getAllByTestId(subheaderLocators.subHeader);
    const [requestFromSubheader] = subheaders;
    expect(requestFromSubheader).toHaveTextContent('Signing with:');
  });
});
