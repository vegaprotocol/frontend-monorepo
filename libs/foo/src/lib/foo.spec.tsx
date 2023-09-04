import { render } from '@testing-library/react';

import Foo from './foo';

describe('Foo', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Foo />);
    expect(baseElement).toBeTruthy();
  });
});
