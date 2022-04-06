import type { ComponentStory, ComponentMeta } from '@storybook/react';

import { EtherscanLink } from '.';

export default {
  title: 'EtherscanLink',
  component: EtherscanLink,
} as ComponentMeta<typeof EtherscanLink>;

const Template: ComponentStory<typeof EtherscanLink> = (args) => (
  <EtherscanLink {...args} />
);

export const Transaction = Template.bind({});
Transaction.args = {
  tx: 'foo',
  text: 'View transaction on Etherscan',
};

export const Address = Template.bind({});
Address.args = {
  address: 'foo',
  text: 'View transaction on Etherscan',
};
