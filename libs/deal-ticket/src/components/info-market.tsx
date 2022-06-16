/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  addDecimalsFormatNumber,
  formatNumber,
  formatNumberPercentage,
  t,
} from '@vegaprotocol/react-helpers';
import {
  KeyValueTable,
  KeyValueTableRow,
  AccordionPanel,
} from '@vegaprotocol/ui-toolkit';
import startCase from 'lodash/startCase';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import type { DealTicketQuery_market } from './__generated__/DealTicketQuery';
import BigNumber from 'bignumber.js';

export interface InfoProps {
  market: DealTicketQuery_market;
}

export const Info = ({ market }: InfoProps) => {
  const headerClassName =
    'text-h4 font-bold uppercase text-black dark:text-white';
  return (
    <div className="p-16 flex flex-col gap-32">
      <div className="flex flex-col gap-16">
        <p className={headerClassName}>{t('Market data')}</p>
        <AccordionPanel
          key="fees"
          title={t('Current Fees')}
          content={
            <>
              <MarketInfoTable data={market.fees.factors} asPercentage={true} />
              <p className="text-ui-small">
                {t(
                  'All fees are paid by price takers and are a % of the trade notional value. Fees are not paid during auction uncrossing.'
                )}
              </p>
            </>
          }
        />
        <AccordionPanel
          key="market-data"
          title={t('Market data')}
          content={
            <MarketInfoTable
              data={market.data}
              decimalPlaces={market.decimalPlaces}
            />
          }
        />
      </div>

      <div className="flex flex-col gap-16">
        <p className={headerClassName}>{t('Market specification')}</p>
        <AccordionPanel
          title={t('Key details')}
          key="details"
          content={
            <MarketInfoTable
              data={pick(
                market,
                'name',
                'decimalPlaces',
                'positionDecimalPlaces',
                'tradingMode',
                'state'
              )}
            />
          }
        />
        <AccordionPanel
          title={t('Instrument')}
          key="instrument"
          content={
            <MarketInfoTable
              data={{
                product: market.tradableInstrument.instrument.product,
                ...market.tradableInstrument.instrument.product.settlementAsset,
              }}
            />
          }
        />
        <AccordionPanel
          title={t('Risk factors')}
          key="risk-model"
          content={
            <MarketInfoTable data={market.riskFactors} unformatted={true} />
          }
        />
        {(market.priceMonitoringSettings?.parameters?.triggers ?? []).map(
          (trigger, i) => (
            <AccordionPanel
              key={`trigger-${i}`}
              title={t(`Price Monitoring Trigger #${i + 1}`)}
              content={<MarketInfoTable data={trigger} />}
            />
          )
        )}
      </div>
    </div>
  );
};

interface RowProps {
  field: string;
  value: any;
  decimalPlaces?: number;
  asPercentage?: boolean;
  unformatted?: boolean;
}

const Row = ({
  field,
  value,
  decimalPlaces,
  asPercentage,
  unformatted,
}: RowProps) => {
  const isNumber = typeof value === 'number' || !isNaN(Number(value));
  const isPrimitive = typeof value === 'string' || isNumber;
  const className = 'text-black dark:text-white text-ui !px-0 !font-normal';
  if (isPrimitive) {
    return (
      <KeyValueTableRow
        key={field}
        inline={isPrimitive}
        muted={true}
        noBorder={true}
        dtClassName={className}
        ddClassName={className}
      >
        {startCase(t(field))}
        {isNumber && !unformatted
          ? decimalPlaces
            ? addDecimalsFormatNumber(value, decimalPlaces)
            : asPercentage
            ? formatNumberPercentage(new BigNumber(value))
            : formatNumber(Number(value))
          : value}
      </KeyValueTableRow>
    );
  }
  return null;
};

export interface MarketInfoTableProps {
  data: any;
  decimalPlaces?: number;
  asPercentage?: boolean;
  unformatted?: boolean;
  omits?: string[];
}

export const MarketInfoTable = ({
  data,
  decimalPlaces,
  asPercentage,
  unformatted,
  omits = ['id', '__typename'],
}: MarketInfoTableProps) => {
  return (
    <KeyValueTable muted={true}>
      {Object.entries(omit(data, ...omits) || []).map(([key, value]) => (
        <Row
          key={key}
          field={key}
          value={value}
          decimalPlaces={decimalPlaces}
          asPercentage={asPercentage}
          unformatted={unformatted || key.toLowerCase().includes('volume')}
        />
      ))}
    </KeyValueTable>
  );
};
