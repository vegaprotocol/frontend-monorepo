import type { ComponentStory, ComponentMeta } from '@storybook/react';
import { cn } from '@vegaprotocol/ui-toolkit';
import { Divider } from './divider';

export default {
  title: 'Divider',
  component: Divider,
} as ComponentMeta<typeof Divider>;

const Template: ComponentStory<typeof Divider> = (args) => {
  return (
    <div
      className={cn('flex', {
        'flex-col': args?.orientation !== 'vertical',
        'h-[50px]': args?.orientation === 'vertical',
      })}
    >
      <div
        className={cn(
          'h-[50px]',
          args?.orientation !== 'vertical' ? 'w-full' : 'w-1/2'
        )}
      />
      <Divider orientation={args?.orientation} />
      <div
        className={cn(
          'h-[50px]',
          args?.orientation !== 'vertical' ? 'w-full' : 'w-2/2'
        )}
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {};

export const Vertical = Template.bind({});
Vertical.args = {
  orientation: 'vertical',
};
