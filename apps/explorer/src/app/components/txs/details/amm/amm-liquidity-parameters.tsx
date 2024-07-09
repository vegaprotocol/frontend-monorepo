import { t } from '@vegaprotocol/i18n';
import type { components } from '../../../../../types/explorer';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
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
          <th></th>
          <th>{t('Price')}</th>
          <th>{t('Leverage at price')}</th>
        </tr>
      </thead>
      {parameters.upperBound && (
        <tr>
          <td title={t('Upper bound')}>
            <VegaIcon name={VegaIconNames.CHEVRON_UP} />
          </td>
          <td>
            <PriceInMarket marketId={marketId} price={parameters.upperBound} />
          </td>
          <td>{parameters.leverageAtUpperBound}</td>
        </tr>
      )}
      {parameters.base && (
        <tr>
          <td title={t('Base price')}>
            <VegaIcon name={VegaIconNames.MINUS} />
          </td>
          <td colSpan={2}>
            <PriceInMarket marketId={marketId} price={parameters.base} />
          </td>
        </tr>
      )}
      {parameters.lowerBound && (
        <tr>
          <td title={t('Lower bound')}>
            <VegaIcon name={VegaIconNames.CHEVRON_DOWN} />
          </td>
          <td>
            <PriceInMarket marketId={marketId} price={parameters.lowerBound} />
          </td>
          <td>{parameters.leverageAtLowerBound}</td>
        </tr>
      )}
    </table>
  );
};
