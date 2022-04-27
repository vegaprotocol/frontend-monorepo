import type { ComponentStory, ComponentMeta } from '@storybook/react';
import { TransactionDialog } from './transaction-dialog';
import { TxState } from '@vegaprotocol/react-helpers';

export default {
  component: TransactionDialog,
  title: 'TransactionDialog',
  parameters: {
    themes: false,
  },
} as ComponentMeta<typeof TransactionDialog>;

const Template: ComponentStory<typeof TransactionDialog> = (args) => (
  <TransactionDialog {...args} />
);

export const Requested = Template.bind({});
Requested.args = {
  name: 'Some tx',
  status: TxState.Requested,
  error: null,
  confirmations: 0,
  txHash: null,
  requiredConfirmations: 1,
  confirmed: false,
};

export const Pending = Template.bind({});
Pending.args = {
  name: 'Some tx',
  status: TxState.Pending,
  error: null,
  confirmations: 1,
  txHash: '0x123123',
  requiredConfirmations: 3,
  confirmed: false,
};
export const Error = Template.bind({});
Error.args = {
  name: 'Some tx',
  status: TxState.Error,
  error: {
    name: 'Error',
    message:
      'Some very long error message with text that should wrap, here is some error data: {"chain":3,"data":"0x08c379000000000000000000000000000000000000000000000000000000000"}',
  },
  confirmations: 0,
  txHash: null,
  requiredConfirmations: 1,
  confirmed: false,
};

export const Complete = Template.bind({});
Complete.args = {
  name: 'Some tx',
  status: TxState.Complete,
  error: null,
  confirmations: 3,
  txHash: '0x123123',
  requiredConfirmations: 3,
  confirmed: true,
};
