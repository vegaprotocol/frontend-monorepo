import type { MarketMaybeWithData } from '@vegaprotocol/market-list';
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
import type { VegaICellRendererParams } from '@vegaprotocol/datagrid';
import { DApp, EXPLORER_MARKET, useLinks } from '@vegaprotocol/environment';

export const MarketTableActions = ({
  value,
}: VegaICellRendererParams<MarketMaybeWithData, 'id'>) => {
  const linkCreator = useLinks(DApp.Explorer);
  if (!value) return <span />;
  return (
    <DropdownMenu
      trigger={
        <DropdownMenuTrigger
          iconName="more"
          className="hover:bg-vega-light-200 dark:hover:bg-vega-dark-200 p-0.5 focus:rounded-full hover:rounded-full"
          data-testid="dropdown-menu"
        />
      }
    >
      <DropdownMenuContent data-testid="market-actions-content">
        <DropdownMenuCopyItem value={value} text={t('Copy Market ID')} />
        <DropdownMenuItem>
          <Link
            href={linkCreator(EXPLORER_MARKET.replace(':id', value))}
            target="_blank"
          >
            <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={16} />
            {t('View on Explorer')}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
