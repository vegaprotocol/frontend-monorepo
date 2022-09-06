import { render } from '@testing-library/react';
import { ProposeFreeform } from './propose-freeform';

describe('ProposeFreeform', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProposeFreeform />);
    expect(baseElement).toBeTruthy();
  });
});
