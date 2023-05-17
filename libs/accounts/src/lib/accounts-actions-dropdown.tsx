import {
  DApp,
  ETHERSCAN_ADDRESS,
  useEtherscanLink,
  useLinks,
} from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCopyItem,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Link,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useTransferDialog } from './transfer-dialog';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';

export const AccountsActionsDropdown = ({
  assetId,
  assetContractAddress,
  onClickDeposit,
  onClickWithdraw,
  onClickBreakdown,
}: {
  assetId: string;
  assetContractAddress?: string;
  onClickDeposit: () => void;
  onClickWithdraw: () => void;
  onClickBreakdown: () => void;
}) => {
  const etherscanLink = useEtherscanLink();
  const openTransferDialog = useTransferDialog((store) => store.open);
  const openAssetDialog = useAssetDetailsDialogStore((store) => store.open);
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
      <DropdownMenuContent>
        <DropdownMenuItem
          key={'deposit'}
          data-testid="deposit"
          onClick={onClickDeposit}
        >
          <span>
            <VegaIcon name={VegaIconNames.DEPOSIT} size={16} />
            {t('Deposit')}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          key={'withdraw'}
          data-testid="withdraw"
          onClick={onClickWithdraw}
        >
          <span>
            <VegaIcon name={VegaIconNames.WITHDRAW} size={16} />
            {t('Withdraw')}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          key={'transfer'}
          data-testid="transfer"
          onClick={() => openTransferDialog(true)}
        >
          <span>
            <VegaIcon name={VegaIconNames.WITHDRAW} size={16} />
            {t('Transfer')}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          key={'breakdown'}
          data-testid="breakdown"
          onClick={onClickBreakdown}
        >
          <span>
            <VegaIcon name={VegaIconNames.BREAKDOWN} size={16} />
            {t('View accounts')}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            openAssetDialog(assetId, e.target as HTMLElement);
          }}
        >
          <span>
            <VegaIcon name={VegaIconNames.BREAKDOWN} size={16} />
            {t('View asset')}
          </span>
        </DropdownMenuItem>
        <DropdownMenuCopyItem value={assetId} text={t('Copy asset ID')} />
        {assetContractAddress && (
          <DropdownMenuItem>
            <Link
              href={etherscanLink(
                ETHERSCAN_ADDRESS.replace(':hash', assetContractAddress)
              )}
              target="_blank"
            >
              <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={16} />
              {t('View on Etherscan')}
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
