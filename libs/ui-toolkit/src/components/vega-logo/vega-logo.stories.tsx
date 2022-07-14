import type { Story, Meta } from '@storybook/react';
import { VegaLogo, VLogo } from './vega-logo';

export default {
  component: VegaLogo,
  title: 'Vega logo',
} as Meta;

const Template: Story = () => <VegaLogo />;
const TemplateVLogo: Story = () => <VLogo />;

export const Default = Template.bind({});
export const VVersion = TemplateVLogo.bind({});
