import { render } from '@testing-library/react';

import { Button } from './button';

describe('Button', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Button>Label</Button>);
    expect(baseElement).toBeTruthy();
  });
});
