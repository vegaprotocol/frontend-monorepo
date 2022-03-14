import { ComponentMeta } from '@storybook/react';
import { VegaWalletContext, VegaWalletContextShape } from '../vega-wallet';
import { DealTicket, DealTicketProps, Market } from './deal-ticket';

export default {
  title: 'DealTicket',
  component: DealTicket,
} as ComponentMeta<typeof DealTicket>;

const defaultWalletContext: VegaWalletContextShape = {
  keypair: null,
  keypairs: null,
  selectPublicKey: () => undefined,
  sendTx: () => Promise.resolve({} as any),
  connect: () => Promise.resolve({} as any),
  disconnect: () => Promise.resolve({} as any),
  connector: null,
};

const defaultMarket: Market = {
  id: 'market-id',
  decimalPlaces: 5,
  tradableInstrument: {
    instrument: {
      product: {
        quoteName: 'USDC',
        settlementAsset: {
          id: 'asset-id',
          symbol: 'ETH',
          name: 'Ethereum',
        },
      },
    },
  },
  tradingMode: 'Continuous',
  state: 'Active',
  depth: {
    lastTrade: {
      price: '12345678',
    },
  },
};

interface StoryArgs {
  props: DealTicketProps;
  walletContext: VegaWalletContextShape;
}

const Template = (args: StoryArgs) => {
  return (
    <VegaWalletContext.Provider value={args.walletContext}>
      <DealTicket {...args.props} />
    </VegaWalletContext.Provider>
  );
};

export const Default = Template.bind({});
// @ts-ignore asdf asdf asdf
Default.args = {
  props: {
    market: defaultMarket,
  },
  walletContext: defaultWalletContext,
};

const keypair = {
  index: 0,
  name: 'Key 0',
  pub: 'ABC123',
  algorithm: { name: 'algo', version: 1 },
  tainted: false,
};
export const WalletConnected = Template.bind({});
// @ts-ignore asdf asdf asdf
WalletConnected.args = {
  props: {
    market: defaultMarket,
  },
  walletContext: { ...defaultWalletContext, keypair, keypairs: [keypair] },
};
