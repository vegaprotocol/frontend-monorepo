import { render } from '@testing-library/react';

import Aaa from './aaa';

describe('Aaa', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Aaa />);
    expect(baseElement).toBeTruthy();
  });
});
