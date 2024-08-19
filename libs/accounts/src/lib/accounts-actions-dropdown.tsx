import {
  ETHERSCAN_ADDRESS,
  useExternalExplorerLink,
} from '@vegaprotocol/environment';
import { useT } from './use-t';
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
  isReadOnly,
  assetId,
  assetContractAddress,
  onClickDeposit,
  onClickCrossChainDeposit,
  onClickWithdraw,
  onClickTransfer,
  onClickSwap,
}: {
  isReadOnly?: boolean;
  assetId: string;
  assetContractAddress?: string;
  onClickDeposit: () => void;
  onClickCrossChainDeposit?: () => void;
  onClickWithdraw: () => void;
  onClickTransfer: () => void;
  onClickSwap: () => void;
}) => {
  const etherscanLink = useExternalExplorerLink();
  const openAssetDialog = useAssetDetailsDialogStore((store) => store.open);
  const t = useT();
  return (
    <ActionsDropdown vertical>
      {isReadOnly ? null : (
        <>
          <DropdownMenuItem
            key={'deposit'}
            data-testid="deposit"
            onClick={onClickDeposit}
          >
            <VegaIcon name={VegaIconNames.DEPOSIT} size={16} />
            {t('Deposit')}
          </DropdownMenuItem>
          {onClickCrossChainDeposit && (
            <DropdownMenuItem
              key={'deposit'}
              data-testid="deposit"
              onClick={onClickCrossChainDeposit}
            >
              <VegaIcon name={VegaIconNames.DEPOSIT} size={16} />
              {t('Cross-chain deposit')}
            </DropdownMenuItem>
          )}
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
            key={'swap'}
            data-testid="swap"
            onClick={onClickSwap}
          >
            <VegaIcon name={VegaIconNames.SWAP} size={16} />
            {t('Swap')}
          </DropdownMenuItem>
        </>
      )}
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
              <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={14} />
              {t('View on Etherscan')}
            </span>
          </Link>
        </DropdownMenuItem>
      )}
    </ActionsDropdown>
  );
};
