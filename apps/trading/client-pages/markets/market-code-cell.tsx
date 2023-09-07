import compact from 'lodash/compact';
import type { ProductType } from '@vegaprotocol/types';
import { ProductTypeMapping, ProductTypeShortName } from '@vegaprotocol/types';
import { StackedCell } from '@vegaprotocol/datagrid';
import { t } from '@vegaprotocol/i18n';

export interface MarketCodeCellProps {
  value: string | undefined; // market code
  data: {
    productType: ProductType | undefined;
    parentMarketID: string | null | undefined;
    successorMarketID: string | null | undefined;
  };
}

export const MarketCodeCell = ({ value, data }: MarketCodeCellProps) => {
  if (!value || !data || !data.productType) return null;

  const infoSpanClasses =
    'mr-1 pr-1 uppercase border-r last:pr-0 last:mr-0 last:border-r-0 border-vega-clight-200 dark:border-vega-cdark-200';

  const info = compact([
    <span
      className={infoSpanClasses}
      key="productType"
      title={ProductTypeMapping[data.productType]}
    >
      {ProductTypeShortName[data.productType]}
    </span>,
    data.parentMarketID && (
      <span
        className={infoSpanClasses}
        key="successor"
        title={t('Successor of a market')}
      >
        {t('SCCR')}
      </span>
    ),
    data.successorMarketID && (
      <span
        className={infoSpanClasses}
        key="parent"
        title={t('Parent of a market')}
      >
        {t('PRNT')}
      </span>
    ),
  ]);

  return <StackedCell primary={value} secondary={info} />;
};
