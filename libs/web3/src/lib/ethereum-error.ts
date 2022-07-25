export class EthereumError extends Error {
  code: number;
  reason: string;

  constructor(message: string, code: number, reason: string) {
    super(message);
    this.name = 'EthereumError';
    this.code = code;
    this.reason = reason;
  }
}

export const isEthereumError = (err: unknown): err is EthereumError => {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    return true;
  }
  return false;
};

export const isExpectedEthereumError = (error: unknown) => {
  const EXPECTED_ERRORS = [4001];

  if (isEthereumError(error) && EXPECTED_ERRORS.indexOf(error.code) >= 0) {
    return true;
  }

  return false;
};
