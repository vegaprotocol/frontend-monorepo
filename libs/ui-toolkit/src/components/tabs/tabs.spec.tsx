import { render, screen } from '@testing-library/react';

import { Tabs, Tab } from './tabs';

const renderComponent = (
  <Tabs>
    <Tab id="one" name="Tab one">
      <p>Tab one content</p>
    </Tab>
    <Tab id="two" name="Tab two">
      <p>Tab two content</p>
    </Tab>
    <Tab id="three" name="Tab three">
      <p>Tab three content</p>
    </Tab>
  </Tabs>
);

describe('Tabs', () => {
  it('should render tabs successfully', () => {
    render(renderComponent);
    expect(screen.getByTestId('Tab one')).toBeInTheDocument();
    expect(screen.getByTestId('Tab two')).toBeInTheDocument();
    expect(screen.getByTestId('Tab three')).toBeInTheDocument();
  });
});
