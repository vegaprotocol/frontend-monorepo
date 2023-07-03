import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCopyItem,
  DropdownMenuTrigger,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { useRef } from 'react';

export const FillActionsDropdown = ({
  tradeId,
  buyOrderId,
  sellOrderId,
}: {
  tradeId: string;
  buyOrderId: string;
  sellOrderId: string;
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) ref.current?.classList.add('open');
        if (!open) ref.current?.classList.remove('open');
      }}
      trigger={
        <DropdownMenuTrigger
          className="hover:bg-vega-light-200 dark:hover:bg-vega-dark-200 [&.open]:bg-vega-light-200 dark:[&.open]:bg-vega-dark-200 p-0.5 rounded-full"
          data-testid="dropdown-menu"
          ref={ref}
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
