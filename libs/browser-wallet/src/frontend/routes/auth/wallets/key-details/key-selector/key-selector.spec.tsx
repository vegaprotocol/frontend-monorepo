import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { locators as dropDownLocators } from '@/components/dropdown/dropdown';
import { KeyListProperties } from '@/components/key-list';

import { KeySelector, locators } from './key-selector';

const ID = '1'.repeat(64);

const MOCK_KEY = {
  publicKey: ID,
  name: 'test',
  index: 0,
};

jest.mock('@/components/key-list', () => ({
  KeyList: ({ onClick }: KeyListProperties) => (
    <button onClick={onClick} data-testid="key-list" />
  ),
}));

jest.mock('@/components/keys/vega-key', () => ({
  VegaKey: () => <div data-testid="vega-key" />,
}));

jest.mock('@/stores/wallets', () => ({
  useWalletStore: jest.fn().mockImplementation((function_) =>
    function_({
      wallets: [
        {
          keys: [
            {
              publicKey: '1'.repeat(64),
              name: 'test',
              index: 0,
            },
            {
              publicKey: '2'.repeat(64),
              name: 'test2',
              index: 1,
            },
            {
              publicKey: '3'.repeat(64),
              name: 'test3',
              index: 2,
            },
          ],
        },
      ],
    })
  ),
}));

const renderComponent = () => {
  return render(
    <>
      <MemoryRouter>
        <KeySelector currentKey={MOCK_KEY} />
      </MemoryRouter>
      <div data-testid="outside-element" />
    </>
  );
};

describe('KeySelector', () => {
  it('renders the currently selected key, opens key list and closes after a key is clicked', async () => {
    // 1125-KEYD-006 When switching, I can see key name, key icon and key address (truncated)
    renderComponent();
    expect(
      screen.getByTestId(dropDownLocators.dropdownSelected)
    ).toHaveTextContent('test');
    fireEvent.click(screen.getByTestId(dropDownLocators.dropdownTrigger));
    await screen.findByTestId(locators.keySelectorDropdownContent);
    const keyList = screen.getByTestId('key-list');
    expect(keyList).toBeInTheDocument();
    fireEvent.click(keyList);
    await waitFor(() =>
      expect(screen.queryByTestId('key-list')).not.toBeInTheDocument()
    );
  });
});
