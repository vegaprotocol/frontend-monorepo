import { render } from '@testing-library/react';
import { ShowMore } from './show-more';

describe('Button', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ShowMore>test</ShowMore>);
    expect(baseElement).toBeTruthy();
  });
});
