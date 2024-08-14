import { render, screen } from '@testing-library/react';

import { locators as headerLocators } from '@/components/header';
// import { locators as hostImageLocators } from '@/components/host-image';
import { locators as subheaderLocators } from '@/components/sub-header';

import { locators, TransactionHeader } from './transaction-header';

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
        origin="https://www.google.com"
        publicKey="3fd42fd5ceb22d99ac45086f1d82d516118a5cb7ad9a2e096cd78ca2c8960c80"
      />
    );
    const subheaders = screen.getAllByTestId(subheaderLocators.subHeader);
    const [requestFromSubheader, signingWithSubheader] = subheaders;
    expect(signingWithSubheader).toHaveTextContent('Signing with');
    expect(requestFromSubheader).toHaveTextContent('Request from');
    // expect(screen.getByTestId(hostImageLocators.hostImage)).toBeVisible();
    expect(screen.getByTestId(headerLocators.header)).toHaveTextContent(
      'Order Submission'
    );
    expect(screen.getByTestId(locators.transactionRequest)).toHaveTextContent(
      'https://www.google.com'
    );
    expect(screen.getByTestId('vega-key')).toBeInTheDocument();
  });
});
