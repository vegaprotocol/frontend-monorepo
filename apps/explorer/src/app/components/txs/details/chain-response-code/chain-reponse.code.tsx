import { Icon, Tooltip } from '@vegaprotocol/ui-toolkit';

// https://github.com/vegaprotocol/vega/blob/develop/core/blockchain/response.go
export const ErrorCodes = new Map([
  [51, 'Transaction failed validation'],
  [60, 'Transaction could not be decoded'],
  [70, 'Error'],
  [71, 'Partial success/error'],
  [80, 'Unknown command'],
  [89, 'Rejected as spam'],
  [0, 'Success'],
]);

export const successCodes = new Set([0, 71]);

interface ChainResponseCodeProps {
  code: number;
  hideLabel?: boolean;
  error?: string;
  hideIfOk?: boolean;
  small?: boolean;
}

/**
 * Someone deposited some of a builtin asset. Builtin assets
 * have no value outside the Vega chain and should appear only
 * on Test networks.
 */
export const ChainResponseCode = ({
  code,
  hideLabel = false,
  error,
  hideIfOk = false,
  small = false,
}: ChainResponseCodeProps) => {
  if (hideIfOk && code === 0) {
    return null;
  }

  const isSuccess = successCodes.has(code);
  const size = small ? 3 : 4;
  const successColour =
    code === 71 ? '!fill-vega-orange' : '!fill-vega-green-600';
  const icon = isSuccess ? (
    <Icon size={size} name="tick-circle" className={`${successColour}`} />
  ) : (
    <Icon size={size} name="cross" className="!fill-vega-pink-500" />
  );
  const label = ErrorCodes.get(code) || 'Unknown response code';

  // Hack for batches with many errors - see https://github.com/vegaprotocol/vega/issues/7245
  const displayError =
    error && error.length > 100 ? error.replace(/,/g, ',\r\n') : error;

  return (
    <Tooltip
      description={
        <span>
          Response code: {code} - {label}
        </span>
      }
    >
      <div className="mt-[-1px] inline-block">
        <span
          className="mr-2"
          aria-label={isSuccess ? 'Success' : 'Warning'}
          role="img"
        >
          {icon}
        </span>
        {hideLabel ? null : <span>{label}</span>}
        {!hideLabel && !!displayError ? (
          <span className="ml-1 whitespace-pre">
            &mdash;&nbsp;{displayError}
          </span>
        ) : null}
      </div>
    </Tooltip>
  );
};
