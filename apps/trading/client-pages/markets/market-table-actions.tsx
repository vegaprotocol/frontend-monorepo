import {
  DropdownMenuItem,
  DropdownMenuCopyItem,
  Link,
  VegaIcon,
  VegaIconNames,
  ActionsDropdown,
} from '@vegaprotocol/ui-toolkit';
import { DApp, EXPLORER_MARKET, useLinks } from '@vegaprotocol/environment';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { useNavigate } from 'react-router-dom';
import { Links } from '../../lib/links';
import { useT } from '../../lib/use-t';

export const MarketActionsDropdown = ({
  marketId,
  assetId,
  successorMarketID,
  parentMarketID,
}: {
  marketId: string;
  assetId: string;
  successorMarketID: string | null | undefined;
  parentMarketID: string | null | undefined;
}) => {
  const t = useT();
  const navigate = useNavigate();
  const open = useAssetDetailsDialogStore((store) => store.open);
  const linkCreator = useLinks(DApp.Explorer);

  return (
    <ActionsDropdown data-testid="market-actions-content">
      <DropdownMenuCopyItem value={marketId} text={t('Copy Market ID')} />
      <DropdownMenuItem>
        <Link
          href={linkCreator(EXPLORER_MARKET.replace(':id', marketId))}
          target="_blank"
        >
          <span className="flex gap-2">
            <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={16} />
            {t('View on Explorer')}
          </span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={(e) => {
          open(assetId, e.target as HTMLElement);
        }}
      >
        <VegaIcon name={VegaIconNames.INFO} size={16} />
        {t('View settlement asset details')}
      </DropdownMenuItem>
      {parentMarketID && (
        <DropdownMenuItem
          onClick={() => {
            navigate(Links.MARKET(parentMarketID));
          }}
        >
          <VegaIcon name={VegaIconNames.EYE} size={16} />
          {t('View parent market')}
        </DropdownMenuItem>
      )}
      {successorMarketID && (
        <DropdownMenuItem
          onClick={() => {
            navigate(Links.MARKET(successorMarketID));
          }}
        >
          <VegaIcon name={VegaIconNames.EYE} size={16} />
          {t('View successor market')}
        </DropdownMenuItem>
      )}
    </ActionsDropdown>
  );
};
