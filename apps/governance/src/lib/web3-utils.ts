export interface TxError {
  message: string;
  code: number;
  data?: unknown;
}

/**
 * Error codes returned from Metamask that we can safely ignore
 */
const IgnoreCodes = {
  ALREADY_PROCESSING: -32002,
  USER_REJECTED: 4001,
};

/**
 * Check if the error from web3/metamask is something expected we can handle
 * and thus ignore
 */
export const isUnexpectedError = (error: Error | TxError) => {
  return !('code' in error && Object.values(IgnoreCodes).includes(error.code));
};

/**
 * Check if the error from web3/metamask is the user rejecting connection or
 * a transaction confirmation prompt
 */
export const isUserRejection = (error: Error | TxError) => {
  return 'code' in error && error.code === IgnoreCodes.USER_REJECTED;
};

/**
 * Check if the error from web3/metamask is the user rejecting connection or
 * a transaction confirmation prompt
 */
export const isAlreadyProcessing = (error: Error | TxError) => {
  return 'code' in error && error.code === IgnoreCodes.ALREADY_PROCESSING;
};
