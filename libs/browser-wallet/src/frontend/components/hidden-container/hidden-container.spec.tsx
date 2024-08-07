import { fireEvent, render, screen } from '@testing-library/react';

import locators from '../locators';
import { HiddenContainer, type HiddenContainerProperties } from './hidden-container';

jest.mock('../copy-with-check', () => ({
  CopyWithCheckmark: () => <div data-testid="copy" />,
}));

const renderComponent = (properties: HiddenContainerProperties) => {
  return render(<HiddenContainer {...properties} />);
};

describe('HiddenContainer', () => {
  it('is hidden initially and displays the mnemonic when the "Reveal" button is clicked', () => {
    // 1129-HDCN-001 - I am provided with a private information that is initially hidden from view
    const hiddenInformation = 'test mnemonic';
    renderComponent({
      hiddenInformation,
      onChange: jest.fn(),
      text: 'Reveal',
    });
    fireEvent.click(screen.getByTestId(locators.mnemonicContainerHidden));
    const mnemonicElement = screen.getByTestId(
      locators.mnemonicContainerMnemonic
    );
    expect(mnemonicElement).toHaveTextContent(hiddenInformation);
  });

  it('hides the mnemonic when the "Hide" button is clicked', () => {
    // 1129-HDCN-002 - I can choose when to reveal/show the information
    const hiddenInformation = 'test mnemonic';
    renderComponent({
      hiddenInformation,
      text: 'Reveal',
    });
    fireEvent.click(screen.getByTestId(locators.mnemonicContainerHidden));
    const hideButton = screen.getByTestId(locators.hideIcon);
    fireEvent.click(hideButton);
    const mnemonicElement = screen.queryByText(hiddenInformation);
    expect(mnemonicElement).not.toBeInTheDocument();
  });

  it('renders a copy button', async () => {
    // 1129-HDCN-003 - I can copy the information into my clipboard
    const hiddenInformation = 'test mnemonic';
    renderComponent({
      hiddenInformation,
      text: 'Reveal',
    });
    fireEvent.click(screen.getByTestId(locators.mnemonicContainerHidden));
    expect(screen.getByTestId('copy')).toBeInTheDocument();
  });

  it('calls onChange if present', () => {
    const onChange = jest.fn();
    const hiddenInformation = 'test mnemonic';
    renderComponent({
      hiddenInformation,
      onChange,
      text: 'Reveal',
    });
    fireEvent.click(screen.getByTestId(locators.mnemonicContainerHidden));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
    const hideButton = screen.getByTestId(locators.hideIcon);
    fireEvent.click(hideButton);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('adds style if wrap is set to true', () => {
    const hiddenInformation = 'test mnemonic';
    renderComponent({
      hiddenInformation,
      text: 'Reveal',
      wrapContent: true,
    });
    fireEvent.click(screen.getByTestId(locators.mnemonicContainerHidden));
    expect(screen.getByTestId(locators.mnemonicContainerMnemonic)).toHaveStyle(
      'word-break: break-all'
    );
  });
});
