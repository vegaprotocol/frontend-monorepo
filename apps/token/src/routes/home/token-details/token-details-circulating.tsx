import { Tranche } from "@vegaprotocol/smart-contracts-sdk";

import { BigNumber } from "../../../lib/bignumber";
import { formatNumber } from "../../../lib/format-number";

/**
 * Add together the circulating tokens from all tranches
 *
 * @param tranches All of the tranches to sum
 * @param decimals decimal places for the formatted result
 * @return The total circulating tokens from all tranches
 */
export function sumCirculatingTokens(tranches: Tranche[] | null): BigNumber {
  let totalCirculating: BigNumber = new BigNumber(0);

  tranches?.forEach(
    (tranche) =>
      (totalCirculating = totalCirculating
        .plus(tranche.total_added)
        .minus(tranche.locked_amount))
  );

  return totalCirculating;
}

/**
 * Renders a table cell containing the total circulating number of Vega tokens, which is the
 * sum of all redeemed tokens across all tranches
 *
 * @param tranches An array of all of the tranches
 * @param decimals Decimal places for this token
 * @constructor
 */
export const TokenDetailsCirculating = ({
  tranches,
}: {
  tranches: Tranche[] | null;
}) => {
  const totalCirculating = sumCirculatingTokens(tranches);
  return (
    <td data-testid="circulating-supply">
      {formatNumber(totalCirculating, 2)}
    </td>
  );
};
