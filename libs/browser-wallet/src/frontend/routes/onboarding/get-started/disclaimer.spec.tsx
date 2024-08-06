import { fireEvent, render, screen } from '@testing-library/react';

import { Disclaimer, locators } from './disclaimer';

describe('Disclaimer Component', () => {
  it('renders read more button and preview paragraph', () => {
    render(<Disclaimer />);
    const readMoreButton = screen.getByTestId(locators.readMoreButton);
    expect(readMoreButton).toBeInTheDocument();
    const previewText = screen.getByTestId(locators.previewText);
    expect(previewText).toBeInTheDocument();
  });

  it('renders disclaimer text in dialog', async () => {
    render(<Disclaimer />);
    fireEvent.click(screen.getByTestId(locators.readMoreButton));
    await screen.findByTestId(locators.disclaimerText);
    expect(screen.getByTestId(locators.disclaimerText)).toBeInTheDocument();
  });

  it('opens dialog on read more button click', () => {
    render(<Disclaimer />);
    const readMoreButton = screen.getByTestId(locators.readMoreButton);

    fireEvent.click(readMoreButton);

    const dialog = screen.getByTestId(locators.dialog);
    expect(dialog).toBeInTheDocument();
  });

  it('renders links to user data policy and feedback', () => {
    render(<Disclaimer />);
    const readMoreButton = screen.getByTestId(locators.readMoreButton);

    fireEvent.click(readMoreButton);

    expect(screen.getByTestId(locators.dataPolicyLink)).toHaveAttribute(
      'href',
      'https://vega.xyz/vega-wallet-user-data-policy/'
    );
    expect(screen.getByTestId(locators.feedbackLink)).toHaveAttribute(
      'href',
      'https://github.com/vegaprotocol/feedback/discussions'
    );
  });
});
