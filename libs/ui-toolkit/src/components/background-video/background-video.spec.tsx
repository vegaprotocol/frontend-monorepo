import { render } from '@testing-library/react';
import { BackgroundVideo } from './background-video';

describe('Background video', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BackgroundVideo />);
    expect(baseElement).toBeTruthy();
  });
});
