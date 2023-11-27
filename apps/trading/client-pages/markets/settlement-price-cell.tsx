import { DApp, EXPLORER_ORACLE, useLinks } from '@vegaprotocol/environment';
import type { DataSourceFilterFragment } from '@vegaprotocol/markets';
import { useOracleSpecBindingData } from '@vegaprotocol/markets';
import { PropertyKeyType } from '@vegaprotocol/types';
import { Link } from '@vegaprotocol/ui-toolkit';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useT } from '../../lib/use-t';

export interface SettlementPriceCellProps {
  oracleSpecId: string | undefined;
  settlementDataSpecBinding: string | undefined;
  filter: DataSourceFilterFragment | undefined;
}

export const SettlementPriceCell = ({
  oracleSpecId,
  settlementDataSpecBinding,
  filter,
}: SettlementPriceCellProps) => {
  const t = useT();
  const linkCreator = useLinks(DApp.Explorer);
  const { property, loading } = useOracleSpecBindingData(
    oracleSpecId,
    settlementDataSpecBinding
  );

  if (!oracleSpecId || loading) {
    return <span>-</span>;
  }

  const renderText = () => {
    if (!property || !filter) {
      return t('Unknown');
    }

    if (
      filter.key.type === PropertyKeyType.TYPE_INTEGER &&
      filter.key.numberDecimalPlaces !== null &&
      filter.key.numberDecimalPlaces !== undefined
    ) {
      return addDecimalsFormatNumber(
        property.value,
        filter.key.numberDecimalPlaces
      );
    }

    return property.value;
  };

  return (
    <Link
      href={linkCreator(EXPLORER_ORACLE.replace(':id', oracleSpecId))}
      className="underline font-mono"
      target="_blank"
    >
      {renderText()}
    </Link>
  );
};
