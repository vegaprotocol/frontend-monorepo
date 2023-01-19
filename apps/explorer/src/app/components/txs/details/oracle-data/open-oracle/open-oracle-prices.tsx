import { t } from '@vegaprotocol/react-helpers';
import { CopyWithTooltip } from '@vegaprotocol/ui-toolkit';
import { TableRow } from '../../../../table';
import { TruncateInline } from '../../../../truncate/truncate';
import { utils } from 'ethers';
import { AbiCoder, hexDataLength } from 'ethers/lib/utils';
type Price = {
  [key: string]: string;
};

interface OpenOraclePricesProps {
  prices: Price;
  signatures: Price;
  messages: Price;
}

/**
 * Someone cancelled an order
 */
export function OpenOraclePrices({
  prices,
  messages,
  signatures,
}: OpenOraclePricesProps) {
  return (
    <table>
      <thead>
        <TableRow modifier="bordered">
          <th>{t('Asset')}</th>
          <th className="text-right">{t('Price')}</th>
          <th>{t('Signature')}</th>
          <th>{t('Message')}</th>
        </TableRow>
      </thead>
      <tbody>
        {Object.keys(prices).map((k: string, i: number) => {
          if (k && prices[k]) {
            const message = messages[i];
            const signature = signatures[i];
            return (
              <OpenOraclePrice
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
  return (
    <TableRow modifier="bordered">
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
    </TableRow>
  );
}
