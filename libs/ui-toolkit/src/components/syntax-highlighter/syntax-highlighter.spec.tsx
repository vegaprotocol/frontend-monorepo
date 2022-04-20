import { render, screen } from '@testing-library/react';

import { SyntaxHighlighter } from './syntax-highlighter';

describe('Syntax highlighter', () => {
  it('should render data successfully', () => {
    const testData = {
      name: 'test of highlighter',
    };

    render(<SyntaxHighlighter data={testData} />);
    expect(screen.getByText('test of highlighter')).toBeInTheDocument();
  });
});
