import { render } from '@testing-library/react';

import UiToolkit from './ui-toolkit';

describe('UiToolkit', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UiToolkit />);
    expect(baseElement).toBeTruthy();
  });
});
