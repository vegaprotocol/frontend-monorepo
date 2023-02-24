import { t } from '@vegaprotocol/utils';

interface JSONOracleDataProps {
  payload: string;
}

/**
 * Renders a JSON oracle. Given the shape could be any valid JSON,
 * this doesn't try to do anything smart - it just renders the message
 */
export const JSONOracleData = ({ payload }: JSONOracleDataProps) => {
  const decodedSubmission = parseData(payload);

  if (!decodedSubmission) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  return (
    <section>
      <code data-testid="json-code">{decodedSubmission}</code>
    </section>
  );
};

/**
 * Safely parses the JSON Oracle payload
 *
 * @param payload base64 encoded JSON
 * @returns Object or null
 */
export function parseData(payload: string) {
  try {
    if (!payload || typeof payload !== 'string') {
      throw new Error('Not a string');
    }
    return atob(payload);
  } catch (e) {
    return null;
  }
}
