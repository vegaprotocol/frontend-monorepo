import { render, screen } from '@testing-library/react';
import { ProductTypeShortName } from '@vegaprotocol/types';
import type { MarketCodeCellProps } from './market-code-cell';
import { MarketCodeCell } from './market-code-cell';

describe('MarketCodeCell', () => {
  const renderComponent = (props: MarketCodeCellProps) => {
    return render(<MarketCodeCell {...props} />);
  };

  it('renders SCCR if the market is a successor', () => {
    const productType = 'Future';
    const code = 'code';
    const props = {
      value: 'code',
      data: {
        productType,
        parentMarketID: 'foo',
        successorMarketID: undefined,
      },
    } as const;
    renderComponent(props);
    expect(screen.getByTestId('stack-cell-primary')).toHaveTextContent(code);
    expect(screen.getByTestId('stack-cell-secondary')).toHaveTextContent(
      ProductTypeShortName[productType]
    );
    expect(screen.getByTestId('stack-cell-secondary')).toHaveTextContent(
      'SCCR'
    );
    expect(screen.getByTestId('stack-cell-secondary')).not.toHaveTextContent(
      'PRNT'
    );
  });

  it('renders PRNT if the market is a parent', () => {
    const productType = 'Future';
    const code = 'code';
    const props = {
      value: 'code',
      data: {
        productType,
        parentMarketID: undefined,
        successorMarketID: 'foo',
      },
    } as const;
    renderComponent(props);
    expect(screen.getByTestId('stack-cell-primary')).toHaveTextContent(code);
    expect(screen.getByTestId('stack-cell-secondary')).toHaveTextContent(
      ProductTypeShortName[productType]
    );
    expect(screen.getByTestId('stack-cell-secondary')).toHaveTextContent(
      'PRNT'
    );
    expect(screen.getByTestId('stack-cell-secondary')).not.toHaveTextContent(
      'SCCR'
    );
  });

  it('renders both SCCR and PRNT if the market is both a parent and a successor', () => {
    const productType = 'Future';
    const code = 'code';
    const props = {
      value: 'code',
      data: {
        productType,
        parentMarketID: 'foo',
        successorMarketID: 'bar',
      },
    } as const;
    renderComponent(props);
    expect(screen.getByTestId('stack-cell-primary')).toHaveTextContent(code);
    expect(screen.getByTestId('stack-cell-secondary')).toHaveTextContent(
      ProductTypeShortName[productType]
    );
    expect(screen.getByTestId('stack-cell-secondary')).toHaveTextContent(
      'PRNT'
    );
    expect(screen.getByTestId('stack-cell-secondary')).toHaveTextContent(
      'SCCR'
    );
  });
});
