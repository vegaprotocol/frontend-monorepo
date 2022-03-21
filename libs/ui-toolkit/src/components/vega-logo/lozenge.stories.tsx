import { Story, Meta } from '@storybook/react';
import { VegaLogo } from './vega-logo';

export default {
  component: VegaLogo,
  title: 'Vega logo',
} as Meta;

const Template: Story = () => <VegaLogo />;

export const Default = Template.bind({});
