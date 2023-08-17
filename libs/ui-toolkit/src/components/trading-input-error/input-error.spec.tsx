import { render } from '@testing-library/react';

import { TradingInputError } from './input-error';

describe('InputError', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TradingInputError />);
    expect(baseElement).toBeTruthy();
  });
});
