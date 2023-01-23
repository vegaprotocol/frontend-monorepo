import { t } from '@vegaprotocol/react-helpers';
import { NestedDataList } from '../../../nested-data-list';
import { OpenOraclePrices } from './open-oracle/open-oracle-prices';

interface OpenOracleDataProps {
  payload: string;
}

/**
 * Decodes Open Oracle data based on it's main parts:
 * - messages
 * - signatures
 * - prices
 */
export const OpenOracleData = ({ payload }: OpenOracleDataProps) => {
  const decodedSubmission = parseData(payload);

  if (!decodedSubmission) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const date = decodedSubmission.timestamp;
  const formattedDate = new Date(date * 1000).toLocaleString();

  return (
    <section>
      <span>{formattedDate}</span>
      <code>
        <OpenOraclePrices
          prices={decodedSubmission.prices}
          messages={decodedSubmission.messages}
          signatures={decodedSubmission.signatures}
        />
      </code>
      <details data-testid="decoded-payload">
        <summary>{t('Decoded payload')}</summary>
        <NestedDataList data={decodedSubmission} />
      </details>
    </section>
  );
};

/**
 * Safely parses the Open Oracle payload
 *
 * @param payload base64 encoded JSON
 * @returns Object or null
 */
export function parseData(payload: string) {
  try {
    if (!payload || typeof payload !== 'string') {
      throw new Error('Not a string');
    }

    const res = JSON.parse(atob(payload));
    if (!res.prices || !res.messages || !res.signatures) {
      throw new Error('Not an open oracle format message');
    }

    return res;
  } catch (e) {
    return null;
  }
}
