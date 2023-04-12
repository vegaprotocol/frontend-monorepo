import { DApp, EXPLORER_ORACLE, useLinks } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import { useOracleSpecBindingData } from '@vegaprotocol/oracles';
import { Link } from '@vegaprotocol/ui-toolkit';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';

export interface SettlementPriceCellProps {
  oracleSpecId: string | undefined;
  decimalPlaces: number;
  settlementDataSpecBinding: string | undefined;
}

export const SettlementPriceCell = ({
  oracleSpecId,
  decimalPlaces,
  settlementDataSpecBinding,
}: SettlementPriceCellProps) => {
  const linkCreator = useLinks(DApp.Explorer);
  const { property, loading } = useOracleSpecBindingData(
    oracleSpecId,
    settlementDataSpecBinding
  );

  if (!oracleSpecId || loading) {
    return <span>-</span>;
  }

  return (
    <Link
      href={linkCreator(EXPLORER_ORACLE.replace(':id', oracleSpecId))}
      className="underline font-mono"
      target="_blank"
    >
      {property
        ? addDecimalsFormatNumber(property.value, decimalPlaces)
        : t('Unknown')}
    </Link>
  );
};
