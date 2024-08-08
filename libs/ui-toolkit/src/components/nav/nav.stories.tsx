import type { Meta, Story } from '@storybook/react';
import { AnchorButton } from '../button';

import { VegaLogo } from '../vega-logo';
import { Nav } from './nav';

export default {
  component: Nav,
  title: 'Nav',
} as Meta;

const Template: Story = ({ icon, title, titleContent }) => (
  <div className="flex w-full">
    <Nav icon={icon} title={title} titleContent={titleContent}>
      <div className="mx-4">
        <AnchorButton>Some link</AnchorButton>{' '}
      </div>
      <div className="mx-4">
        <AnchorButton>Some other link</AnchorButton>
      </div>
    </Nav>
  </div>
);

const props = {
  icon: <VegaLogo />,
  title: 'Title',
  titleContent: <div>Content next to title</div>,
};

export const Default = Template.bind({});
Default.args = {
  ...props,
};
