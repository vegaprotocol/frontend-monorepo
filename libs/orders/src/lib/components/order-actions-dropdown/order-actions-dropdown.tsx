import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCopyItem,
  DropdownMenuTrigger,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';

export const OrderActionsDropdown = ({ id }: { id: string }) => {
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
        <DropdownMenuCopyItem value={id} text={t('Copy order ID')} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
