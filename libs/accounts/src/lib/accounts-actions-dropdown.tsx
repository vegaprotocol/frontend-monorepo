import { ETHERSCAN_ADDRESS, useEtherscanLink } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import {
  ActionsDropdown,
  DropdownMenuCopyItem,
  DropdownMenuItem,
  Link,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';

export const AccountsActionsDropdown = ({
  assetId,
  assetContractAddress,
  onClickDeposit,
  onClickWithdraw,
  onClickBreakdown,
  onClickTransfer,
}: {
  assetId: string;
  assetContractAddress?: string;
  onClickDeposit: () => void;
  onClickWithdraw: () => void;
  onClickBreakdown: () => void;
  onClickTransfer: () => void;
}) => {
  const etherscanLink = useEtherscanLink();
  const openAssetDialog = useAssetDetailsDialogStore((store) => store.open);

  return (
    <ActionsDropdown>
      <DropdownMenuItem
        key={'deposit'}
        data-testid="deposit"
        onClick={onClickDeposit}
      >
        <VegaIcon name={VegaIconNames.DEPOSIT} size={16} />
        {t('Deposit')}
      </DropdownMenuItem>
      <DropdownMenuItem
        key={'withdraw'}
        data-testid="withdraw"
        onClick={onClickWithdraw}
      >
        <VegaIcon name={VegaIconNames.WITHDRAW} size={16} />
        {t('Withdraw')}
      </DropdownMenuItem>
      <DropdownMenuItem
        key={'transfer'}
        data-testid="transfer"
        onClick={onClickTransfer}
      >
        <VegaIcon name={VegaIconNames.TRANSFER} size={16} />
        {t('Transfer')}
      </DropdownMenuItem>
      <DropdownMenuItem
        key={'breakdown'}
        data-testid="breakdown"
        onClick={onClickBreakdown}
      >
        <VegaIcon name={VegaIconNames.BREAKDOWN} size={16} />
        {t('View usage breakdown')}
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={(e) => {
          openAssetDialog(assetId, e.target as HTMLElement);
        }}
      >
        <VegaIcon name={VegaIconNames.INFO} size={16} />
        {t('View asset details')}
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
            <span className="flex gap-2">
              <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={16} />
              {t('View on Etherscan')}
            </span>
          </Link>
        </DropdownMenuItem>
      )}
    </ActionsDropdown>
  );
};
