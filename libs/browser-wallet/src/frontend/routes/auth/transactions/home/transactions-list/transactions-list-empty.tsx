export const locators = {
  transactionListEmpty: 'transaction-list-empty',
};

export const TransactionListEmpty = () => {
  return (
    <div data-testid={locators.transactionListEmpty} className="mt-6 text-sm">
      No transactions have been placed using this wallet on this network.
    </div>
  );
};
