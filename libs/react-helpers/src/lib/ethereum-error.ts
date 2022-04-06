export class EthereumError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
    this.name = 'EthereumError';
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
