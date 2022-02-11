import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { EtherscanLink } from '.';
import { EthereumChainIds, EthereumChainNames } from '../../utils/web3';

export default {
  title: 'EtherscanLink',
  component: EtherscanLink,
  argTypes: {
    chainId: {
      options: Object.values(EthereumChainIds),
      control: {
        type: 'select', // Type 'select' is automatically inferred when 'options' is defined
        labels: EthereumChainNames,
      },
    },
  },
} as ComponentMeta<typeof EtherscanLink>;

const Template: ComponentStory<typeof EtherscanLink> = (args) => (
  <EtherscanLink {...args} />
);

export const MainnetTx = Template.bind({});
MainnetTx.args = {
  chainId: EthereumChainIds.Mainnet,
  tx: 'foo',
  text: 'View transaction on Etherscan',
};

export const RopstenTx = Template.bind({});
RopstenTx.args = {
  chainId: EthereumChainIds.Ropsten,
  tx: 'foo',
  text: 'View transaction on Etherscan',
};

export const MainnetAddress = Template.bind({});
MainnetAddress.args = {
  chainId: EthereumChainIds.Mainnet,
  address: 'foo',
  text: 'View transaction on Etherscan',
};

export const RopstenAddress = Template.bind({});
RopstenAddress.args = {
  chainId: EthereumChainIds.Ropsten,
  address: 'foo',
  text: 'View transaction on Etherscan',
};
