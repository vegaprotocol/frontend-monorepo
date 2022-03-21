import { render } from '@testing-library/react';

import { Lozenge } from './lozenge';

describe('Lozenge', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Lozenge>Lozenge</Lozenge>);
    expect(baseElement).toBeTruthy();
  });
});
