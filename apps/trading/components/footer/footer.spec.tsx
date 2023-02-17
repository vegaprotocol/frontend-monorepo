import { fireEvent, render, screen } from '@testing-library/react';
import { NodeUrl, NodeHealth } from './footer';

describe('NodeUrl', () => {
  it('can open node switcher by clicking the node url', () => {
    const mockOpenNodeSwitcher = jest.fn();
    const node = 'https://api.n99.somenetwork.vega.xyz';

    render(<NodeUrl url={node} openNodeSwitcher={mockOpenNodeSwitcher} />);

    fireEvent.click(screen.getByText(/n99/));
    expect(mockOpenNodeSwitcher).toHaveBeenCalled();
  });
});

describe('NodeHealth', () => {
  const mockOpenNodeSwitcher = jest.fn();
  const cases = [
    { diff: 0, classname: 'bg-vega-green-550', text: 'Operational' },
    { diff: 5, classname: 'bg-warning', text: '5 Blocks behind' },
    { diff: null, classname: 'bg-danger', text: 'Non operational' },
  ];
  it.each(cases)(
    'renders correct text and indicator color for $diff block difference',
    (elem) => {
      render(
        <NodeHealth
          blockDiff={elem.diff}
          openNodeSwitcher={mockOpenNodeSwitcher}
        />
      );
      expect(screen.getByTestId('indicator')).toHaveClass(elem.classname);
      expect(screen.getByText(elem.text)).toBeInTheDocument();
      fireEvent.click(screen.getByText(elem.text));
      expect(mockOpenNodeSwitcher).toHaveBeenCalled();
    }
  );
});
