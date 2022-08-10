import type { Story, Meta } from '@storybook/react';
import { ResizablePanel } from './resizable-panel';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';

export default {
  component: ResizablePanel,
  title: 'ResizablePanel',
} as Meta;

const Template: Story = (args) => (
  <div className="h-48">
    <ResizablePanel vertical={true}>
      <Allotment.Pane minSize={20}>
        <div>Panel 1</div>
      </Allotment.Pane>
      <Allotment.Pane minSize={20}>
        <div>Panel 2</div>
      </Allotment.Pane>
    </ResizablePanel>
  </div>
);

export const Default = Template.bind({});
