import { render } from '@testing-library/react';

import { Fills } from './fills';

describe('Fills', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Fills partyId="party-id" fills={[]} />);
    expect(baseElement).toBeTruthy();
  });
});
