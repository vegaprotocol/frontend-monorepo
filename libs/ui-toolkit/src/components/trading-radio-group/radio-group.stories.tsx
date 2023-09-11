import type { StoryFn, Meta } from '@storybook/react';
import type { TradingRadioGroupProps } from './radio-group';
import { TradingRadioGroup, TradingRadio } from './radio-group';

export default {
  component: TradingRadioGroup,
  title: 'RadioGroup trading',
} as Meta;

const Template: StoryFn<TradingRadioGroupProps> = (args) => (
  <TradingRadioGroup {...args}>
    <TradingRadio id="item-1" value="1" label="Item 1" />
    <TradingRadio id="item-2" value="2" label="Item 2" />
    <TradingRadio id="item-3" value="3" label="Disabled item" disabled={true} />
  </TradingRadioGroup>
);

export const Vertical = Template.bind({});
export const Horizontal = Template.bind({});
Horizontal.args = {
  orientation: 'horizontal',
};
