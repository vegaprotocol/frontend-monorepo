import { fireEvent, render, screen } from '@testing-library/react';

import { usePopoverStore } from '@/stores/popover-store';
import { mockStore } from '@/test-helpers/mock-store';

import { locators, PopoverOpenSplash } from '.';

jest.mock('@/stores/popover-store');

describe('PopoverOpenSplash', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('renders correctly when popoverOpen is false', () => {
    mockStore(usePopoverStore, {
      popoverOpen: false,
      focusPopover: jest.fn(),
      isPopoverInstance: false,
    });

    const { container } = render(<PopoverOpenSplash />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders correctly when popoverOpen is true and isPopoverInstance is true', () => {
    mockStore(usePopoverStore, {
      popoverOpen: true,
      focusPopover: jest.fn(),
      isPopoverInstance: true,
    });

    const { container } = render(<PopoverOpenSplash />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders correctly when popoverOpen is true and isPopoverInstance is false', () => {
    const mockFocusPopover = jest.fn();
    mockStore(usePopoverStore, {
      popoverOpen: true,
      focusPopover: mockFocusPopover,
      isPopoverInstance: false,
    });

    render(<PopoverOpenSplash />);

    expect(screen.getByTestId(locators.popoverSplash)).toBeInTheDocument();
    expect(
      screen.getByText("You're viewing your wallet in another window")
    ).toBeInTheDocument();

    const continueButton = screen.getByRole('button', {
      name: /continue here/i,
    });
    fireEvent.click(continueButton);

    expect(mockFocusPopover).toHaveBeenCalledTimes(1);
  });
});
