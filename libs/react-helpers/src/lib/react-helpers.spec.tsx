import { render } from '@testing-library/react';

import ReactHelpers from './react-helpers';

describe('ReactHelpers', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ReactHelpers />);
    expect(baseElement).toBeTruthy();
  });
});
