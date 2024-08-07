import { render, screen } from '@testing-library/react';

import { CodeWindow } from './code-window';

jest.mock('../copy-with-check', () => ({
  CopyWithCheckmark: () => <div data-testid="copy-with-checkmark">Copy</div>,
}));

describe('CodeWindow', () => {
  const content = 'const a = 1; const b = 2;';
  const text = 'Copy code';

  it('renders the component with the correct content and text', () => {
    render(<CodeWindow content={content} text={text} />);
    const codeWindow = screen.getByTestId('code-window');
    const codeWindowContent = screen.getByTestId('code-window-content');

    expect(codeWindow).toBeInTheDocument();
    expect(codeWindowContent).toHaveTextContent(content);
  });

  it('renders the copy with clipboard component', () => {
    render(<CodeWindow content={content} text={text} />);
    expect(screen.getByTestId('copy-with-checkmark')).toBeInTheDocument();
  });
});
