import { render, screen } from '@testing-library/react';

import { AmountWithSymbol, locators } from './amount-with-symbol';

describe('AmountWithSymbol', () => {
  it('renders price and symbol correctly', () => {
    const price = 9.99;
    const symbol = 'USD';

    render(<AmountWithSymbol amount={price} symbol={symbol} />);

    const priceElement = screen.getByTestId(locators.amount);
    const symbolElement = screen.getByTestId(locators.symbol);
    const priceWithSymbolElement = screen.getByTestId(
      locators.amountWithSymbol
    );

    expect(priceElement).toHaveTextContent(price.toString());
    expect(symbolElement).toHaveTextContent(symbol);
    expect(priceWithSymbolElement).toContainElement(priceElement);
    expect(priceWithSymbolElement).toContainElement(symbolElement);
    expect(screen.getByTestId(locators.amountWithSymbol)).toHaveTextContent(
      '9.99 USD'
    );
  });
  it('does not render symbol when it is not passed in', () => {
    const price = 9.99;

    render(<AmountWithSymbol amount={price} symbol={undefined} />);

    expect(screen.queryByTestId(locators.symbol)).not.toBeInTheDocument();
  });
});
