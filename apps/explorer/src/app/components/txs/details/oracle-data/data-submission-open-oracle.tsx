import { t } from '@vegaprotocol/react-helpers';
import { NestedDataList } from '../../../nested-data-list';
import { OpenOraclePrices } from './open-oracle/open-oracle-prices';

interface OpenOracleDataProps {
  payload: string;
}

/**
 * Someone cancelled an order
 */
export const OpenOracleData = ({ payload }: OpenOracleDataProps) => {
  if (!payload) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const decodedSubmission = JSON.parse(atob(payload));

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
      <details>
        <summary>{t('Decoded payload')}</summary>
        <NestedDataList data={decodedSubmission} />
      </details>
    </section>
  );
};
