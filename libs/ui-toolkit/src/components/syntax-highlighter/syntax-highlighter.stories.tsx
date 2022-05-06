import type { Story, Meta } from '@storybook/react';
import { SyntaxHighlighter } from './syntax-highlighter';

export default {
  component: SyntaxHighlighter,
  title: 'Syntax Highlighter',
} as Meta;

const data = {
  name: 'Level one',
  undefinedProp: undefined,
  nullProp: null,
  level: 1,
  nestedData: {
    name: 'Level two',
    level: 2,
  },
};

export const Default: Story = () => <SyntaxHighlighter data={data} />;
