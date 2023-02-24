import { t } from '@vegaprotocol/utils';
import { CopyWithTooltip } from '@vegaprotocol/ui-toolkit';
import { TableRow } from '../../../../table';
import { TruncateInline } from '../../../../truncate/truncate';
import { utils } from 'ethers';

export type Price = {
  [key: string]: string;
};

interface OpenOraclePricesProps {
  prices: Price;
  signatures: string[];
  messages: string[];
}

/**
 * Open Oracle price table, showing the entries in this
 * decoded message
 *
 * Notes:
 * - Signer is derived by recovering the address from the
 *   signature and the message. This is currently disabled
 *   as the implementation is incorrect
 */
export function OpenOraclePrices({
  prices,
  messages,
  signatures,
}: OpenOraclePricesProps) {
  if (
    !prices ||
    !messages ||
    !signatures ||
    Object.keys(prices).length !== messages.length ||
    signatures.length !== messages.length
  ) {
    return null;
  }

  return (
    <table data-testid="openoracleprices">
      <thead>
        <TableRow modifier="bordered">
          <th>{t('Asset')}</th>
          <th className="text-right">{t('Price')}</th>
          <th>{t('Signature')}</th>
          <th>{t('Message')}</th>
          {/* <th>{t('Signer')}</th> */}
        </TableRow>
      </thead>
      <tbody>
        {Object.keys(prices).map((k: string, i: number) => {
          if (k && prices[k]) {
            const message = messages[i];
            const signature = signatures[i];
            return (
              <OpenOraclePrice
                key={`price-${i}`}
                asset={k}
                value={prices[k]}
                message={message}
                signature={signature}
              />
            );
          } else {
            return null;
          }
        })}
      </tbody>
    </table>
  );
}

type OpenOraclePriceProps = {
  asset: string;
  value: string;
  message: string;
  signature: string;
};

export function OpenOraclePrice({
  asset,
  value,
  signature,
  message,
}: OpenOraclePriceProps) {
  //  const addr = getAddressFromMessageAndSignature(message, signature);
  return (
    <TableRow modifier="bordered" key={`${asset}`}>
      <td className="px-4">{asset}</td>
      <td className="px-4 text-right">{value}</td>
      <td className="px-4">
        <CopyWithTooltip text={signature}>
          <button>
            <TruncateInline text={signature} startChars={5} endChars={5} />
          </button>
        </CopyWithTooltip>
      </td>
      <td className="px-4">
        <CopyWithTooltip text={message}>
          <button>
            <TruncateInline text={message} startChars={5} endChars={5} />
          </button>
        </CopyWithTooltip>
      </td>
      {/*<td className="px-4">
        <CopyWithTooltip text={message}>
          <button>
            <TruncateInline text={addr} startChars={5} endChars={5} />
          </button>
      </CopyWithTooltip>
      </td> */}
    </TableRow>
  );
}

export function getAddressFromMessageAndSignature(
  message: string,
  signature: string
) {
  try {
    const m = utils.hashMessage(utils.arrayify(utils.keccak256(message)));
    const s = utils.splitSignature(
      signature.slice(0, 130) + signature.slice(-2)
    );

    return utils.recoverAddress(m, s);
  } catch (e) {
    return '-';
  }
}
