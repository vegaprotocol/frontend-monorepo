import { act, render, screen, waitFor } from '@testing-library/react';

import { LoaderBone, locators } from '.';

jest.mock('!/config', () => ({
  default: {},
}));

describe('LoaderBone', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  it('should have tests render a row for each row of width passed in', () => {
    render(<LoaderBone width={2} height={1} />);
    expect(screen.getAllByTestId(locators.boneCol)).toHaveLength(2);
  });
  it('should render a square for each row of width*height passed in', () => {
    render(<LoaderBone width={2} height={2} />);
    expect(screen.getAllByTestId(locators.boneSquare)).toHaveLength(4);
  });

  it('should change which squares are visible on rerender', async () => {
    render(<LoaderBone width={10} height={10} />);
    {
      const squares = screen.getAllByTestId(locators.boneSquare);
      const visibleSquares = squares.filter(
        (square) => square.style.opacity === '1'
      );
      expect(visibleSquares).toHaveLength(33);
    }
    act(() => jest.advanceTimersToNextTimer());
    await waitFor(() => {
      const squares = screen.getAllByTestId(locators.boneSquare);
      const visibleSquares = squares.filter(
        (square) => square.style.opacity === '1'
      );
      return expect(visibleSquares).not.toHaveLength(33);
    });
    {
      const squares = screen.getAllByTestId(locators.boneSquare);
      const visibleSquares = squares.filter(
        (square) => square.style.opacity === '1'
      );
      expect(visibleSquares).toHaveLength(26);
    }
  });
});
