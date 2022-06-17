import type { Story, Meta } from '@storybook/react';
import { Input } from './input';
export default {
  component: Input,
  title: 'Input',
} as Meta;

const Template: Story = (args) => <Input {...args} value="I type words" />;

const customElementPlaceholder = (
  <span
    style={{
      fontFamily: 'monospace',
      backgroundColor: 'grey',
      padding: '4px',
    }}
  >
    Ω
  </span>
);

export const Default = Template.bind({});
Default.args = {};

export const WithError = Template.bind({});
WithError.args = {
  hasError: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};

export const TypeDate = Template.bind({});
TypeDate.args = {
  type: 'date',
};

export const TypeDateTime = Template.bind({});
TypeDateTime.args = {
  type: 'datetime-local',
};

export const IconPrepend: Story = () => (
  <Input value="I type words" prependIconName="search" />
);

export const IconAppend: Story = () => (
  <Input value="I type words and even more words" appendIconName="search" />
);

export const ElementPrepend: Story = () => (
  <Input value="<- custom element" prependElement={customElementPlaceholder} />
);

export const ElementAppend: Story = () => (
  <Input value="custom element ->" appendElement={customElementPlaceholder} />
);
