export interface TxError {
  message: string;
  code: number;
  data?: unknown;
}

/**
 * Error codes returned from Metamask that we can safely not capture in Sentry
 */
const IgnoreCodes = {
  ALREADY_PROCESSING: -32002,
  USER_REJECTED: 4001,
};

/**
 * Check if the error from web3/metamask is something expected we can handle
 * and thus not capture in Sentry
 */
export const isUnexpectedError = (error: Error | TxError) => {
  if ("code" in error && Object.values(IgnoreCodes).includes(error.code)) {
    return false;
  }
  return true;
};

/**
 * Check if the error from web3/metamask is the user rejecting connection or
 * a transaction confirmation prompt
 */
export const isUserRejection = (error: Error | TxError) => {
  if ("code" in error && error.code === IgnoreCodes.USER_REJECTED) {
    return true;
  }
  return false;
};

/**
 * Check if the error from web3/metamask is the user rejecting connection or
 * a transaction confirmation prompt
 */
export const isAlreadyProcessing = (error: Error | TxError) => {
  if ("code" in error && error.code === IgnoreCodes.ALREADY_PROCESSING) {
    return true;
  }
  return false;
};
