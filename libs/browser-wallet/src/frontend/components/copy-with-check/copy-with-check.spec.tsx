import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import locators from '../locators';
import { CopyWithCheckmark } from './copy-with-check';

jest.mock('react-copy-to-clipboard', () => ({ children, onCopy }: any) => (
  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
  <div onClick={onCopy}>{children}</div>
));

describe('CopyWithCheckmark', () => {
  const text = 'Some code to copy';
  const children = <code>{text}</code>;

  it('renders the component with the correct text and icon side', async () => {
    render(<CopyWithCheckmark text={text}>{children}</CopyWithCheckmark>);
    const copyButton = screen.getByTestId('copy-with-check');
    const codeElement = screen.getByText(text);

    expect(codeElement).toBeInTheDocument();
    expect(copyButton).toHaveTextContent(text);
    expect(screen.getByTestId(locators.copyIcon)).toBeInTheDocument();
    expect(screen.queryByTestId(locators.tickIcon)).not.toBeInTheDocument();

    fireEvent.click(copyButton);

    const tick = await screen.findByTestId(locators.tickIcon);

    expect(screen.queryByTestId(locators.copyIcon)).not.toBeInTheDocument();
    expect(tick).toBeInTheDocument();
    expect(tick).toHaveClass('text-intent-success');

    await waitFor(() =>
      expect(screen.queryByTestId(locators.tickIcon)).not.toBeInTheDocument()
    );
  });

  it('renders the icon on the left hand side if passed left', async () => {
    render(
      <CopyWithCheckmark text={text} iconSide="left">
        {children}
      </CopyWithCheckmark>
    );
    const copyButton = screen.getByTestId('copy-with-check');
    expect(screen.getByTestId(locators.copyIcon)).toBeInTheDocument();
    expect(screen.queryByTestId(locators.tickIcon)).not.toBeInTheDocument();

    fireEvent.click(copyButton);

    const tick = await screen.findByTestId(locators.tickIcon);

    expect(screen.queryByTestId(locators.copyIcon)).not.toBeInTheDocument();
    expect(tick).toBeInTheDocument();
    expect(tick).toHaveClass('text-intent-success');
    await waitFor(() =>
      expect(screen.queryByTestId(locators.tickIcon)).not.toBeInTheDocument()
    );
  });

  it('changes back to a copy button after a second', async () => {
    render(
      <CopyWithCheckmark text={text} iconSide="right">
        {children}
      </CopyWithCheckmark>
    );
    const copyButton = screen.getByTestId('copy-with-check');

    fireEvent.click(copyButton);

    const tick = await screen.findByTestId(locators.tickIcon);

    expect(screen.queryByTestId(locators.copyIcon)).not.toBeInTheDocument();
    expect(tick).toBeInTheDocument();
    expect(tick).toHaveClass('text-intent-success');

    await screen.findByTestId(locators.copyIcon);
    expect(screen.queryByTestId(locators.tickIcon)).not.toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByTestId(locators.tickIcon)).not.toBeInTheDocument()
    );
  });
});
