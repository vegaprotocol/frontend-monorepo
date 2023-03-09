import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NodeHealth, NodeUrl, HealthIndicator } from './footer';

describe('NodeHealth', () => {
  it('controls the node switcher dialog', async () => {
    const mockOnClick = jest.fn();
    render(
      <NodeHealth
        onClick={mockOnClick}
        url={'https://api.n99.somenetwork.vega.xyz'}
        blockHeight={100}
        blockDiff={0}
      />
    );
    await userEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalled();
  });
});

describe('NodeUrl', () => {
  it('renders correct part of node url', () => {
    const node = 'https://api.n99.somenetwork.vega.xyz';
    const expectedText = node.split('.').slice(1).join('.');

    render(<NodeUrl url={node} />);

    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });
});

describe('HealthIndicator', () => {
  const cases = [
    { diff: 0, classname: 'bg-vega-green-550', text: 'Operational' },
    { diff: 5, classname: 'bg-warning', text: '5 Blocks behind' },
    { diff: null, classname: 'bg-danger', text: 'Non operational' },
  ];
  it.each(cases)(
    'renders correct text and indicator color for $diff block difference',
    (elem) => {
      render(<HealthIndicator blockDiff={elem.diff} />);
      expect(screen.getByTestId('indicator')).toHaveClass(elem.classname);
      expect(screen.getByText(elem.text)).toBeInTheDocument();
    }
  );
});
