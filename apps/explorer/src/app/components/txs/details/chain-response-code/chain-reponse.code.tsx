import { t } from '@vegaprotocol/react-helpers';

// https://github.com/vegaprotocol/vega/blob/develop/core/blockchain/response.go
export const ErrorCodes = new Map([
  [51, 'Transaction failed validation'],
  [60, 'Transaction could not be decoded'],
  [70, 'Internal error'],
  [80, 'Unknown command'],
  [89, 'Rejected as spam'],
  [0, 'Success'],
]);

export const successCodes = new Set([0]);

interface ChainResponseCodeProps {
  code: number;
  hideLabel?: boolean;
}

/**
 * Someone deposited some of a builtin asset. Builtin assets
 * have no value outside the Vega chain and should appear only
 * on Test networks.
 */
export const ChainResponseCode = ({
  code,
  hideLabel = false,
}: ChainResponseCodeProps) => {
  const isError = successCodes.has(code);

  const icon = isError ? '✅' : '❌';
  const label = ErrorCodes.get(code) || 'Unknown response code';

  return (
    <div title={`Response code: ${code} - ${label}`}>
      <span
        className="mr-2"
        aria-label={isError ? 'Warning' : 'Success'}
        role="img"
      >
        {icon}
      </span>
      {hideLabel ? null : <span>{label}</span>}
    </div>
  );
};
