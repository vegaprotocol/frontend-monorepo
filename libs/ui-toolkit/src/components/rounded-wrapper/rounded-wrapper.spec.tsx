import { render } from '@testing-library/react';

import { RoundedWrapper } from './rounded-wrapper';

describe('Lozenge', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <RoundedWrapper>Rounded wrapper</RoundedWrapper>
    );
    expect(baseElement).toBeTruthy();
  });
});
