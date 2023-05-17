import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCopyItem,
  DropdownMenuTrigger,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';

export const FillActionsDropdown = ({
  tradeId,
  buyOrderId,
  sellOrderId,
}: {
  tradeId: string;
  buyOrderId: string;
  sellOrderId: string;
}) => {
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
        <DropdownMenuCopyItem value={tradeId} text={t('Copy trade ID')} />
        <DropdownMenuCopyItem
          value={buyOrderId}
          text={t('Copy buy order ID')}
        />
        <DropdownMenuCopyItem
          value={sellOrderId}
          text={t('Copy sell order ID')}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
