import { render, screen } from '@testing-library/react';

import { Arrow } from './arrow';

describe('Arrow', () => {
  it('should render successfully for positive values', () => {
    render(<Arrow value={0.5} />);
    expect(screen.queryByTestId('arrow-up')).toBeTruthy();
    expect(screen.queryByTestId('arrow-down')).toBeFalsy();
  });

  it('should render successfully for negative values', () => {
    render(<Arrow value={-0.5} />);
    expect(screen.queryByTestId('arrow-down')).toBeTruthy();
    expect(screen.queryByTestId('arrow-up')).toBeFalsy();
  });

  it('should not render successfully for zero values', () => {
    render(<Arrow value={0} />);
    expect(screen.queryByTestId('arrow-down')).toBeNull();
    expect(screen.queryByTestId('arrow-up')).toBeNull();
  });
});
