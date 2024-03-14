export class ConnectorError extends Error {
  code: number;
  data: string | undefined;

  constructor(message: string, code: number, data?: string) {
    super(message);
    this.name = 'ConnectorError';
    this.code = code;
    this.data = data;
  }
}

export const ConnectorErrors = {
  userRejected: { message: 'user rejected', code: 0 },
  noConnector: { message: 'not connected', code: 1 },
  connect: { message: 'failed to connect', code: 2 },
  disconnect: { message: 'failed to disconnect', code: 3 },
  chainId: { message: 'incorrect chain id', code: 4 },
  listKeys: { message: 'failed to list keys', code: 5 },
  isConnected: { message: 'failed to check connection', code: 6 },
  sendTransaction: { message: 'failed to send transaction', code: 7 },
  unknown: { message: 'unknown error', code: 8 },
  noWallet: { message: 'no wallet running', code: 9 },
};

export const userRejectedError = (data?: string) => {
  return new ConnectorError(
    ConnectorErrors.userRejected.message,
    ConnectorErrors.userRejected.code,
    data
  );
};

export const noConnectorError = (data?: string) => {
  return new ConnectorError(
    ConnectorErrors.noConnector.message,
    ConnectorErrors.noConnector.code,
    data
  );
};

export const connectError = (data?: string) => {
  return new ConnectorError(
    ConnectorErrors.connect.message,
    ConnectorErrors.connect.code,
    data
  );
};

export const disconnectError = (data?: string) => {
  return new ConnectorError(
    ConnectorErrors.disconnect.message,
    ConnectorErrors.disconnect.code,
    data
  );
};

export const chainIdError = (data?: string) => {
  return new ConnectorError(
    ConnectorErrors.chainId.message,
    ConnectorErrors.chainId.code,
    data
  );
};

export const listKeysError = (data?: string) => {
  return new ConnectorError(
    ConnectorErrors.listKeys.message,
    ConnectorErrors.listKeys.code,
    data
  );
};

export const isConnectedError = (data?: string) => {
  return new ConnectorError(
    ConnectorErrors.isConnected.message,
    ConnectorErrors.isConnected.code,
    data
  );
};

export const sendTransactionError = (data?: string) => {
  return new ConnectorError(
    ConnectorErrors.sendTransaction.message,
    ConnectorErrors.sendTransaction.code,
    data
  );
};

export const unknownError = (data?: string) => {
  return new ConnectorError(
    ConnectorErrors.unknown.message,
    ConnectorErrors.unknown.code,
    data
  );
};

export const noWalletError = (data?: string) => {
  return new ConnectorError(
    ConnectorErrors.noWallet.message,
    ConnectorErrors.noWallet.code,
    data
  );
};
