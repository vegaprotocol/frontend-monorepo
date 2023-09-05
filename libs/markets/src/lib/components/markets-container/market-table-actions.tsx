import { t } from '@vegaprotocol/i18n';
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

export const MarketActionsDropdown = ({
  marketId,
  assetId,
}: {
  marketId: string;
  assetId: string;
}) => {
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
    </ActionsDropdown>
  );
};
