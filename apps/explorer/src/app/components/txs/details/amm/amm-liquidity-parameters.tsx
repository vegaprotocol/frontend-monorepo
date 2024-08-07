import { t } from '@vegaprotocol/i18n';
import type { components } from '../../../../../types/explorer';
import PriceInMarket from '../../../price-in-market/price-in-market';

interface ConcentratedLiquidityParametersProps {
  parameters: ConcentratedLiquidityParameters;
  marketId: string;
}

export type ConcentratedLiquidityParameters =
  components['schemas']['v1SubmitAMMConcentratedLiquidityParameters'];

/**
 * Cancel an existing AMM
 */
export const ConcentratedLiquidityParametersDetails = ({
  parameters,
  marketId,
}: ConcentratedLiquidityParametersProps) => {
  if (!parameters) {
    return null;
  }

  return (
    <table>
      <thead>
        <tr className="bold">
          <th align="left" className="pr-2">
            {t('Bound')}
          </th>
          <th className="px-4">{t('Leverage at price')}</th>
          <th className="px-2">{t('Price')}</th>
        </tr>
      </thead>
      {parameters.upperBound && (
        <tr>
          <td className="pr-2" title={t('Upper bound')} align="center">
            {t('Upper bound')}
          </td>
          <td align="center">{parameters.leverageAtUpperBound}×</td>
          <td className="px-4" align="right">
            <PriceInMarket marketId={marketId} price={parameters.upperBound} />
          </td>
        </tr>
      )}
      {parameters.base && (
        <tr>
          <td className="pr-2" title={t('Base price')}>
            {t('Base')}
          </td>
          <td></td>
          <td className="px-4" align="right">
            <PriceInMarket marketId={marketId} price={parameters.base} />
          </td>
        </tr>
      )}
      {parameters.lowerBound && (
        <tr>
          <td className="pr-2" title={t('Lower bound')} align="center">
            {t('Lower bound')}
          </td>
          <td align="center">{parameters.leverageAtLowerBound}×</td>
          <td className="px-4" align="right">
            <PriceInMarket marketId={marketId} price={parameters.lowerBound} />
          </td>
        </tr>
      )}
    </table>
  );
};
