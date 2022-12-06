import type { Meta, Story } from '@storybook/react';
import { ButtonLink } from '../button';

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
        <ButtonLink>Some link</ButtonLink>{' '}
      </div>
      <div className="mx-4">
        <ButtonLink>Some other link</ButtonLink>
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
