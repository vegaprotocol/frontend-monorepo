import { render } from '@testing-library/react';

import DealTicket from './deal-ticket';

describe('DealTicket', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DealTicket />);
    expect(baseElement).toBeTruthy();
  });
});
