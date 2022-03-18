import { render } from '@testing-library/react';

import { StatusMessage } from './index';

describe('Status message', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StatusMessage>test</StatusMessage>);
    expect(baseElement).toBeTruthy();
  });
});
