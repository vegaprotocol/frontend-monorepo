export type ReceiptComponentProperties = { transaction: any };
export type TransactionComponent = (
  properties: ReceiptComponentProperties
) => JSX.Element | null;
export type ReceiptMap = { [key in TransactionKeys]: TransactionComponent };
