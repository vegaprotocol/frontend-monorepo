import type { Story, Meta } from '@storybook/react';
import { AgPriceCellChange } from './price-change-cell';

export default {
  component: AgPriceCellChange,
  title: 'AgPriceCellChange',
} as Meta;

const Template: Story = (args) => (
  <AgPriceCellChange candles={[args['candles']]} {...args} />
);

export const Increased = Template.bind({});
Increased.args = {
  candles: ['4564', '5674', '6784'],
  decimalPlaces: 3,
};

export const Decreased = Template.bind({});
Decreased.args = {
  candles: ['6784', '4564', '5674'],
  decimalPlaces: 3,
};
