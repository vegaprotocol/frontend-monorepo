import { FlashCell } from './flash-cell';
import type { Meta, Story } from '@storybook/react';
import * as React from 'react';

export default {
  title: 'Component/FlashCell',
  argTypes: {
    value: {
      control: { type: 'range', min: -20, max: 20, step: 1 },
    },
  },
} as Meta;

const Template: Story<{ value: number }> = ({ value }) => (
  <FlashCell value={value}>{value.toFixed(0)}</FlashCell>
);

export const Basic = Template.bind({});
Basic.args = {
  value: 100,
};
