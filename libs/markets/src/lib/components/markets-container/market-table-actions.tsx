import { t } from '@vegaprotocol/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCopyItem,
  Link,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { DApp, EXPLORER_MARKET, useLinks } from '@vegaprotocol/environment';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';

export const MarketTableActions = ({
  marketId,
  assetId,
}: {
  marketId: string;
  assetId: string;
}) => {
  const open = useAssetDetailsDialogStore((store) => store.open);
  const linkCreator = useLinks(DApp.Explorer);
  return (
    <DropdownMenu
      trigger={
        <DropdownMenuTrigger
          className="hover:bg-vega-light-200 dark:hover:bg-vega-dark-200 p-0.5 focus:rounded-full hover:rounded-full"
          data-testid="dropdown-menu"
        >
          <VegaIcon name={VegaIconNames.KEBAB} />
        </DropdownMenuTrigger>
      }
    >
      <DropdownMenuContent data-testid="market-actions-content">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
