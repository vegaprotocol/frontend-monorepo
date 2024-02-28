export class ConnectorError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.name = 'ConnectorError';
    this.code = code;
  }
}

export const ConnectorErrors = {
  userRejected: new ConnectorError('user rejected', 0),
  noConnector: new ConnectorError('no connector', 1),
  connect: new ConnectorError('failed to connect', 2),
  disconnect: new ConnectorError('failed to disconnect', 3),
  chainId: new ConnectorError('incorrect chain', 4),
  listKeys: new ConnectorError('failed to list keys', 5),
  isConnected: new ConnectorError('failed to check connection', 6),
  sendTransaction: new ConnectorError('failed to send transaction', 7),
  unknown: new ConnectorError('unknown error', 8),
  noWallet: new ConnectorError('no wallet running', 9),
};
