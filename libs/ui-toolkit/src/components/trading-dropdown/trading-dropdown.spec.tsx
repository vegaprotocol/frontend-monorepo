import {
  TradingDropdown,
  TradingDropdownContent,
  TradingDropdownTrigger,
} from './trading-dropdown';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('DropdownMenu', () => {
  const text = 'Dropdown menu content';

  // Upgrade from @radix-ui/react-dropdown-menu 0.1.6 to 2.0.2 renders
  // dropdowns inline (rather than portals). Currently not using a portal
  // will break the UI due to z-index issues
  it('renders using a portal', async () => {
    render(
      <div className="test-wrapper">
        <TradingDropdown
          trigger={
            <TradingDropdownTrigger>
              <button>Trigger</button>
            </TradingDropdownTrigger>
          }
        >
          <TradingDropdownContent>
            <p>{text}</p>
          </TradingDropdownContent>
        </TradingDropdown>
      </div>
    );

    userEvent.click(screen.getByText(/trigger/i));
    const contentElement = await screen.findByText(text);
    expect(contentElement).toBeInTheDocument();
    // if content is within .test-wrapper then its not been rendered in a portal
    expect(contentElement.closest('.test-wrapper')).toBe(null);
  });
});
