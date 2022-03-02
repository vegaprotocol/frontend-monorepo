import { render } from '@testing-library/react';

import { InputError } from './inputError';

describe('InputError', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputError />);
    expect(baseElement).toBeTruthy();
  });
});
