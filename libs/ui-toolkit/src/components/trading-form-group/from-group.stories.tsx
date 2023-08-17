import type { StoryFn, Meta } from '@storybook/react';
import { TradingInput } from '../trading-input';
import type { TradingFormGroupProps } from './form-group';
import { TradingFormGroup } from './form-group';
export default {
  component: TradingFormGroup,
  title: 'FormGroup',
  argTypes: {
    label: {
      type: 'string',
    },
    labelFor: {
      type: 'string',
    },
    labelDescription: {
      type: 'string',
    },
    className: {
      type: 'string',
    },
    hasError: {
      type: 'boolean',
    },
    disabled: {
      type: 'boolean',
    },
  },
} as Meta;

const Template: StoryFn<TradingFormGroupProps> = (args) => (
  <TradingFormGroup {...args}>
    <TradingInput id="labelFor" />
  </TradingFormGroup>
);

export const Default = Template.bind({});
Default.args = {
  label: 'Label',
  labelFor: 'labelFor',
};

export const WithLabelDescription = Template.bind({});
WithLabelDescription.args = {
  label: 'Label',
  labelFor: 'labelFor',
  labelDescription: 'Description text',
};
