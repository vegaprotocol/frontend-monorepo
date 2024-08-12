import { cn } from '../utils/cn';
import type { ComponentStory } from '@storybook/react';
type Args = { type: string; alternatives: string; isAlpha: boolean };
const sizeArr = [
  'text-3xl',
  'text-2xl',
  'text-xl',
  'text-lg',
  'text-lg',
  'text-base',
  'text-sm',
  'text-xs',
];
const TextSample = ({ alternatives, isAlpha, type }: Args) => {
  return (
    <div className="m-4 flex h-16">
      <div className="text-small flex flex-col mr-16 justify-end w-32">
        {type}:
      </div>
      <div
        className={cn(
          'flex-grow flex flex-col justify-end text-left items-start',
          { 'font-alpha calt': isAlpha },
          [alternatives, type]
        )}
      >
        Lorem ipsum dolor sit amet, consectetur adipiscing elit
      </div>
    </div>
  );
};

const Template: ComponentStory<typeof TextSample> = (
  args: Omit<Args, 'type'>
) => (
  <div className="m-4">
    <h1 className="sbdocs sbdocs-h1">Typography</h1>
    {sizeArr.map((size) => (
      <TextSample {...args} type={size} />
    ))}
  </div>
);

export default {
  title: 'Primitives/Typography',
  component: Template,
  argTypes: {
    isAlpha: {
      name: 'Alpha Lyrae font',
      options: [true, false],
      control: { type: 'radio' },
    },
    alternatives: {
      name: 'Font features',
      options: ['none', 'calt', 'liga'],
      control: { type: 'select' },
    },
  },
};

export const Default = Template;
Default.args = {
  isAlpha: true,
  alternatives: 'none',
};
