import { fireEvent, render, screen } from '@testing-library/react';
import { Tooltip } from './tooltip';

it('Renders a tooltip', async () => {
  const props = {
    description: 'description',
    children: <button>Tooltip</button>,
  };
  render(<Tooltip {...props} />);
  // radix applies the data-state attribute
  expect(screen.getByRole('button')).toHaveAttribute('data-state', 'closed');
  fireEvent.pointerMove(screen.getByRole('button'));
  expect(await screen.findByRole('tooltip')).toBeInTheDocument();
});

it('Doesnt render a tooltip if no description provided', () => {
  const props = {
    description: undefined,
    children: <button>Tooltip</button>,
  };
  render(<Tooltip {...props} />);
  expect(screen.getByRole('button')).not.toHaveAttribute(
    'data-state',
    'closed'
  );
  fireEvent.pointerMove(screen.getByRole('button'));
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});
