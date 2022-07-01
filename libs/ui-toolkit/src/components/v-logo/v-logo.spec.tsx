import { render, screen } from '@testing-library/react';

import { VLogo } from './v-logo';

describe('V logo', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<VLogo />);
    expect(baseElement).toBeTruthy();
  });

  it('should have proper fill color', () => {
    render(
      <div className="text-white">
        <VLogo />
      </div>
    );
    expect(screen.findByRole('cos')).toBeTruthy();
  });
});
