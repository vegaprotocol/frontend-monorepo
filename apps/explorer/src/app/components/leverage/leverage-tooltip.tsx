import { t } from '@vegaprotocol/i18n';

const borderClass =
  'border-solid border-2 border-vega-dark-200 border-collapse p-2';

export type LeverageTooltipProps = {
  marginFactor: string;
  leverage: number | string;
};

/**
 * Simple details renderer for Leverage component. Shows the original
 * Margin Factor value and the calculated Leverage value. No validation is done.
 */
export function LeverageTooltip({
  marginFactor,
  leverage,
}: LeverageTooltipProps) {
  return (
    <table className={borderClass}>
      <tbody>
        <tr>
          <th className={`text-left ${borderClass}`}>{t('Margin factor')}</th>
          <td className={borderClass}>{marginFactor}</td>
        </tr>
        <tr>
          <th className={`text-left ${borderClass}`}>{t('Leverage')}</th>
          <td className="p-2">{leverage}&times;</td>
        </tr>
      </tbody>
    </table>
  );
}
