import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('shows tabs display the correct content when clicked', async () => {
    render(renderComponent);
    expect(screen.getByText('Tab one content')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Tab two'));
    expect(await screen.getByText('Tab two content')).toBeInTheDocument();
  });

  it('shows the', async () => {
    render(
      <Tabs>
        <Tab
          id="one"
          name="Tab one"
          menu={
            <>
              <button>Tab 1 button 1</button>
              <button>Tab 1 button 2</button>
            </>
          }
        >
          <p>Tab one content</p>
        </Tab>
        <Tab
          id="two"
          name="Tab two"
          menu={
            <>
              <button>Tab 2 button 1</button>
              <button>Tab 2 button 2</button>
            </>
          }
        >
          <p>Tab two content</p>
        </Tab>
      </Tabs>
    );

    expect(screen.getByText('Tab one content')).toBeInTheDocument();
    expect(screen.getByText('Tab 1 button 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 1 button 2')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Tab two'));
    expect(await screen.getByText('Tab two content')).toBeInTheDocument();
    expect(screen.getByText('Tab 2 button 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2 button 2')).toBeInTheDocument();
  });
});
