import { fireEvent, render, screen } from '@testing-library/react';
import { Tooltip, type TooltipProps, TooltipProvider } from './tooltip';

const renderComponent = (props: TooltipProps) => {
  return render(
    <TooltipProvider>
      <Tooltip {...props} />
    </TooltipProvider>
  );
};

it('Renders a tooltip', async () => {
  const props = {
    description: 'description',
    children: <button>Tooltip</button>,
  };
  renderComponent(props);
  // radix applies the data-state attribute
  expect(screen.getByRole('button')).toHaveAttribute('data-state', 'closed');
  fireEvent.pointerMove(screen.getByRole('button'));
  expect(await screen.findByRole('tooltip')).toBeInTheDocument();
});

it('Renders a controlled tooltip', async () => {
  const props = {
    description: 'description',
    children: <button>Tooltip</button>,
    open: true,
  };
  renderComponent(props);
  // radix applies the data-state attribute
  const trigger = screen.getByRole('button');
  expect(trigger).toHaveAttribute('data-state', 'instant-open');
  expect(screen.queryByRole('tooltip')).toBeInTheDocument();
});

it('Doesnt render a tooltip if no description provided', () => {
  const props = {
    description: undefined,
    children: <button>Tooltip</button>,
  };
  renderComponent(props);
  expect(screen.getByRole('button')).not.toHaveAttribute(
    'data-state',
    'closed'
  );
  fireEvent.pointerMove(screen.getByRole('button'));
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});

it('Doesnt render a controlled tooltip if no description provided', () => {
  const props = {
    description: undefined,
    children: <button>Tooltip</button>,
    open: true,
  };
  renderComponent(props);
  expect(screen.getByRole('button')).not.toHaveAttribute(
    'data-state',
    'closed'
  );
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});
