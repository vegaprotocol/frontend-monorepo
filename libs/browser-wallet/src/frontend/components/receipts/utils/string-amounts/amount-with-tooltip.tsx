import { Tooltip, truncateMiddle } from '@vegaprotocol/ui-toolkit';

import { useNetwork } from '@/contexts/network/network-context';

import { ExternalLink } from '../../../external-link';
import { Info } from '../../../icons/info';
import { DecimalTooltip } from './decimal-tooltip';

export const locators = {
  amount: 'amount',
  assetExplorerLink: 'asset-explorer-link',
  amountWithTooltip: 'amount-with-tooltip',
};

export const AmountWithTooltip = ({
  assetId,
  amount,
}: {
  assetId: string;
  amount: string;
}) => {
  const { explorer } = useNetwork();

  const assetHref = `${explorer}/assets/${assetId}`;
  return (
    <span
      className="flex items-center flex-wrap"
      data-testid={locators.amountWithTooltip}
    >
      <Tooltip
        description={
          <DecimalTooltip
            variableName="decimals"
            entityLink={assetHref}
            entityText="asset"
          />
        }
      >
        <span className="flex">
          <span className="mr-1" data-testid={locators.amount}>
            {amount}
          </span>
          <Info />
        </span>
      </Tooltip>
      &nbsp;
      <ExternalLink
        data-testid={locators.assetExplorerLink}
        className="text-surface-0-fg-muted"
        href={assetHref}
      >
        {truncateMiddle(assetId)}
      </ExternalLink>
    </span>
  );
};
