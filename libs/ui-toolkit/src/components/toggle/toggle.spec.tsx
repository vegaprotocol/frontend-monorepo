import { render, screen } from '@testing-library/react';

import { Toggle } from './toggle';

describe('Toggle', () => {
  it('should render button successfully', () => {
    render(
      <Toggle
        name="test"
        toggles={[
          {
            label: 'Option 1',
            value: 'test-1',
          },
          {
            label: 'Option 2',
            value: 'test-2',
          },
        ]}
      />
    );
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });
});
