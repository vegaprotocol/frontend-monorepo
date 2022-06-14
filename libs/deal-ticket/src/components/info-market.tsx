import { t } from '@vegaprotocol/react-helpers';
import {
  KeyValueTable,
  KeyValueTableRow,
  Accordion,
} from '@vegaprotocol/ui-toolkit';
import type { DealTicketQuery_market } from '../__generated__/DealTicketQuery';

export interface InfoProps {
  market: DealTicketQuery_market;
}

export const Info = ({ market }: InfoProps) => {
  return (
    <>
      <Accordion
        title={t('Key details')}
        content={<MarketInfoTable data={market} />}
        open={true}
      />
      <Accordion
        title={t('Market data')}
        content={<MarketInfoTable data={market} />}
        open={true}
      />
      <Accordion
        title={t('Fees')}
        content={<MarketInfoTable data={market} />}
        open={true}
      />
      <Accordion
        title={t('Price Monitoring Settings')}
        content={<MarketInfoTable data={market} />}
        open={true}
      />
      <Accordion
        title={t('Market details')}
        content={<MarketInfoTable data={market} />}
        open={true}
      />
      <Accordion
        title={t('Instrument')}
        content={<MarketInfoTable data={market} />}
        open={true}
      />
      <Accordion
        title={t('Risk Model')}
        content={<MarketInfoTable data={market} />}
        open={true}
      />
    </>
  );
};

export interface RowProps {
  key: string;
  value: any;
}

export const renderRow = ({ key, value }: RowProps) => {
  const isObject = isJsonObject(JSON.stringify(value));
  console.log(key, value, isObject);
  if (!isObject) {
    return (
      <KeyValueTableRow key={key} inline={!isObject} muted={true}>
        {t(key)}
        {value}
      </KeyValueTableRow>
    );
  }
  return null;
};

export const isJsonObject = (str: string) => {
  try {
    return JSON.parse(str) && Object.keys(JSON.parse(str)).length > 0;
  } catch (e) {
    return false;
  }
};

export const MarketInfoTable = ({ data }: { data: any }) => {
  return (
    <KeyValueTable muted={true}>
      {(Object.entries(data) || []).map(([key, value]) =>
        renderRow({ key, value })
      )}
    </KeyValueTable>
  );
};
