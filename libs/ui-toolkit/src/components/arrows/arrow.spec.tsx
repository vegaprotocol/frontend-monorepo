import { render } from '@testing-library/react';

import { Arrow } from './arrow';

describe('Arrow', () => {
  it('should render successfully for positive values', () => {
    const { baseElement } = render(<Arrow value={0.5} />);
    expect(baseElement).toBeTruthy();
    expect(baseElement.querySelector('.border-b-green')).toBeTruthy();
  });

  it('should render successfully for negative values', () => {
    const { baseElement } = render(<Arrow value={-0.5} />);
    expect(baseElement).toBeTruthy();
    expect(baseElement.querySelector('.border-t-red')).toBeTruthy();
  });

  it('should not render successfully for zero values', () => {
    const { baseElement } = render(<Arrow value={0} />);
    expect(baseElement.querySelector('.border-t-red')).toBeFalsy();
    expect(baseElement.querySelector('.border-b-green')).toBeFalsy();
  });
});
