import { render, screen, cleanup } from '@testing-library/react';
import { JsonDiff } from './json-diff';

describe('JsonDiff', () => {
  afterEach(cleanup);

  it('renders without crashing', () => {
    render(<JsonDiff left={{}} right={{}} />);
    expect(screen.getByTestId('json-diff')).toBeInTheDocument();
  });

  it('shows the correct message when both objects are identical', () => {
    render(<JsonDiff left={{}} right={{}} />);
    expect(screen.getByText('Data is identical')).toBeInTheDocument();
  });

  it('does not show the "identical" message when both objects are not identical', () => {
    render(
      <JsonDiff
        left={{
          name: 'test',
        }}
        right={{
          name: 'test2',
        }}
      />
    );
    expect(screen.queryByText('Data is identical')).not.toBeInTheDocument();
  });
});
