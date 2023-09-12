import type { StoryFn, Meta } from '@storybook/react';
import { TradingOption, TradingSelect, TradingRichSelect } from './select';
import { FormGroup } from '../form-group';

export default {
  component: TradingSelect,
  title: 'Select trading',
} as Meta;

const Template: StoryFn = (args) => (
  <FormGroup label="Select an option" labelFor={args.id}>
    <TradingSelect {...args}>
      <option value="Option 1">Option 1</option>
      <option value="Option 2">Option 2</option>
      <option value="Option 3">Option 3</option>
    </TradingSelect>
  </FormGroup>
);

const RichSelectTemplate: StoryFn = ({ placeholder, ...props }) => (
  <FormGroup label="Select an option" labelFor={props.id}>
    <TradingRichSelect placeholder={placeholder} {...props} />
  </FormGroup>
);

export const Default = Template.bind({});
Default.args = {
  id: 'select-default',
};

export const WithError = Template.bind({});
WithError.args = {
  id: 'select-has-error',
  hasError: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  id: 'select-disabled',
  disabled: true,
};

export const RichDefaultSelect = RichSelectTemplate.bind({});
RichDefaultSelect.args = {
  id: 'rich',
  name: 'rich',
  placeholder: 'Select an option',
  onValueChange: (v: string) => {
    // eslint-disable-next-line no-console
    console.log(v);
  },
  children: (
    <>
      <TradingOption value="1">
        <div className="flex flex-col justify-start items-start">
          <span>Option One</span>
          <span className="text-xs">First option</span>
        </div>
      </TradingOption>
      <TradingOption value="2">
        <div className="flex flex-col justify-start items-start">
          <span>Option Two</span>
          <span className="text-xs">Second option</span>
        </div>
      </TradingOption>
      <TradingOption value="3">
        <div className="flex flex-col justify-start items-start">
          <span>Option Three</span>
          <span className="text-xs">Third option</span>
        </div>
      </TradingOption>
      <TradingOption value="4">
        <div className="flex flex-col justify-start items-start">
          <span>Option Four</span>
          <span className="text-xs">Fourth option</span>
        </div>
      </TradingOption>
      <TradingOption value="5">
        <div className="flex flex-col justify-start items-start">
          <span>Option Five</span>
          <span className="text-xs">Fifth option</span>
        </div>
      </TradingOption>
      <TradingOption value="6">
        <div className="flex flex-col justify-start items-start">
          <span>Option Six</span>
          <span className="text-xs">Sixth option</span>
        </div>
      </TradingOption>
    </>
  ),
};
