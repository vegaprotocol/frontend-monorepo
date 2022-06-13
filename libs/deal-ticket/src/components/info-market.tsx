import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import type { DealTicketQuery_market } from '../__generated__/DealTicketQuery';

export interface InfoProps {
  market: DealTicketQuery_market;
}

export const Info = ({ market }: InfoProps) => {
  console.log(market);
  return (
    <KeyValueTable data-testid="info" muted={true}>
      {(Object.entries(market) || []).map(([key, value]) =>
        renderRow({ key, value })
      )}
    </KeyValueTable>
  );
};

export const renderRow = ({ key, value }: { key: string; value: any }) => {
  const isSyntaxRow = isJsonObject(value);
  return (
    <KeyValueTableRow key={key} inline={!isSyntaxRow}>
      {key}
      {key}
    </KeyValueTableRow>
  );
};

export const isJsonObject = (str: string) => {
  try {
    return JSON.parse(str) && Object.keys(JSON.parse(str)).length > 0;
  } catch (e) {
    return false;
  }
};
