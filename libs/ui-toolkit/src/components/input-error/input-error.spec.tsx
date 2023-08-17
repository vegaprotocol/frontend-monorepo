import { render } from '@testing-library/react';

import { InputError } from './input-error';

describe('InputError', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputError />);
    expect(baseElement).toBeTruthy();
  });
});
