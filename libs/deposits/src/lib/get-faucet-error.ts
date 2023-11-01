import type { TxError } from '@vegaprotocol/web3';
import { useT } from './use-t';

export const useGetFaucetError = (error: TxError | null, symbol?: string) => {
  const t = useT();
  const reasonMap: {
    [reason: string]: string;
  } = {
    'faucet not enabled': t(
      'The {{symbol}} faucet is not available at this time',
      { symbol }
    ),
    'must wait faucetCallLimit between faucet calls': t(
      'You have exceeded the maximum number of faucet attempts allowed'
    ),
    'user rejected transaction': t(
      'The faucet transaction was rejected by the connected Ethereum wallet'
    ),
  };
  // render a customized failure message from the map above or fallback
  // to a non generic error message
  return error && 'reason' in error && reasonMap[error.reason]
    ? reasonMap[error.reason]
    : t('Faucet of {{symbol}} failed', { symbol });
};
