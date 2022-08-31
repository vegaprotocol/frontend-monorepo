import type { Story, Meta } from '@storybook/react';
import { ResizableGrid } from './resizable-grid';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';

export default {
  component: ResizableGrid,
  title: 'ResizablePanel',
} as Meta;

const Template: Story = (args) => (
  <div className="h-48">
    <ResizableGrid vertical={true}>
      <Allotment.Pane minSize={20}>
        <div>Panel 1</div>
      </Allotment.Pane>
      <Allotment.Pane minSize={20}>
        <div>Panel 2</div>
      </Allotment.Pane>
    </ResizableGrid>
  </div>
);

export const Default = Template.bind({});
