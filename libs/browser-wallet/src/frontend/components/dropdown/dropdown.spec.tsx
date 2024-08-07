import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Dropdown, type DropdownProperties, locators } from './dropdown';

const defaultProps: DropdownProperties = {
  trigger: <div data-testid="trigger" />,
  content: () => <div data-testid="content" />,
  enabled: true,
};

const renderComponent = (properties: DropdownProperties = defaultProps) => {
  return render(<Dropdown {...properties} />);
};

describe('DropDown', () => {
  it('renders the trigger and opens content on click', async () => {
    renderComponent();
    fireEvent.click(screen.getByTestId(locators.dropdownTrigger));
    await screen.findByTestId('content');
  });

  it('renders the trigger and does not open if enabled is true', async () => {
    renderComponent({
      ...defaultProps,
      enabled: false,
    });
    fireEvent.click(screen.getByTestId('trigger'));
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('closes modal when clicking trigger', async () => {
    renderComponent();
    fireEvent.click(screen.getByTestId(locators.dropdownTrigger));
    await screen.findByTestId('content');
    fireEvent.click(screen.getByTestId(locators.dropdownTrigger));
    await waitFor(() =>
      expect(screen.queryByTestId('key-list')).not.toBeInTheDocument()
    );
  });

  it('closes dropdown when clicking outside', async () => {
    const { container } = renderComponent();
    fireEvent.click(screen.getByTestId(locators.dropdownTrigger));
    await screen.findByTestId('content');
    fireEvent.pointerDown(
      container,
      new PointerEvent('pointerdown', {
        ctrlKey: false,
        button: 0,
      })
    );
    await waitFor(() =>
      expect(screen.queryByTestId('key-list')).not.toBeInTheDocument()
    );
  });

  it('closes dropdown when escape key is pressed', async () => {
    const { container } = renderComponent();
    fireEvent.click(screen.getByTestId(locators.dropdownTrigger));
    await screen.findByTestId('content');
    fireEvent.keyDown(container, {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      charCode: 27,
    });
    await waitFor(() =>
      expect(screen.queryByTestId('key-list')).not.toBeInTheDocument()
    );
  });
});
