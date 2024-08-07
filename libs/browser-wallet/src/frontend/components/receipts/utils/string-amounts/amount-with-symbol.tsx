export const locators = {
  amount: 'amount',
  symbol: 'symbol',
  amountWithSymbol: 'amount-with-symbol',
};

export const AmountWithSymbol = ({
  amount,
  symbol,
}: {
  amount: string | number;
  symbol?: string;
}) => {
  return (
    <div
      className="flex items-center flex-wrap"
      data-testid={locators.amountWithSymbol}
    >
      <span data-testid={locators.amount}>{amount}</span>
      &nbsp;
      {symbol ? (
        <span className="text-vega-dark-300" data-testid={locators.symbol}>
          {symbol}
        </span>
      ) : null}
    </div>
  );
};
