import { render, screen, cleanup } from '@testing-library/react';
import { JsonDiff } from './json-diff';
import { create } from 'jsondiffpatch';

jest.mock('jsondiffpatch', () => {
  const realModule = jest.requireActual('jsondiffpatch');

  return {
    ...realModule,
    create: jest.fn().mockImplementation(() => ({
      diff: (left: unknown, right: unknown) => {
        if (JSON.stringify(left) === JSON.stringify(right)) {
          return undefined;
        }

        return { some: 'difference' };
      },
    })),
  };
});

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

  it('renders diff when objects are different', () => {
    const left = { a: 1 };
    const right = { a: 2 };

    // The component uses "dangerouslySetInnerHTML" to render HTML,
    // so we can't really expect a specific output.
    // However, we can expect that the output is not "Data is identical"
    render(<JsonDiff left={left} right={right} />);
    expect(screen.queryByText('Data is identical')).not.toBeInTheDocument();
  });

  it('passes the objectHash function to the jsondiffpatch create method', () => {
    const objectHash = (obj: unknown) => {
      if (typeof obj === 'object' && obj !== null && 'id' in obj) {
        return (obj as { id: number }).id.toString();
      }
      return undefined;
    };

    const left = { id: 1 };
    const right = { id: 2 };

    render(<JsonDiff left={left} right={right} objectHash={objectHash} />);

    expect(create).toHaveBeenCalledWith({ objectHash });
  });
});
