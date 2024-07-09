import {
  ETHERSCAN_ADDRESS,
  useExternalExplorerLink,
} from '@vegaprotocol/environment';
import { useT } from './use-t';
import {
  ActionsDropdown,
  TradingDropdownCopyItem,
  TradingDropdownItem,
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
  onClickWithdraw,
  onClickTransfer,
  onClickSwap,
}: {
  isReadOnly?: boolean;
  assetId: string;
  assetContractAddress?: string;
  onClickDeposit: () => void;
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
          <TradingDropdownItem
            key={'deposit'}
            data-testid="deposit"
            onClick={onClickDeposit}
          >
            <VegaIcon name={VegaIconNames.DEPOSIT} size={16} />
            {t('Deposit')}
          </TradingDropdownItem>
          <TradingDropdownItem
            key={'withdraw'}
            data-testid="withdraw"
            onClick={onClickWithdraw}
          >
            <VegaIcon name={VegaIconNames.WITHDRAW} size={16} />
            {t('Withdraw')}
          </TradingDropdownItem>
          <TradingDropdownItem
            key={'transfer'}
            data-testid="transfer"
            onClick={onClickTransfer}
          >
            <VegaIcon name={VegaIconNames.TRANSFER} size={16} />
            {t('Transfer')}
          </TradingDropdownItem>
          <TradingDropdownItem
            key={'swap'}
            data-testid="swap"
            onClick={onClickSwap}
          >
            <VegaIcon name={VegaIconNames.SWAP} size={16} />
            {t('Swap')}
          </TradingDropdownItem>
        </>
      )}
      <TradingDropdownItem
        onClick={(e) => {
          openAssetDialog(assetId, e.target as HTMLElement);
        }}
      >
        <VegaIcon name={VegaIconNames.INFO} size={16} />
        {t('View asset details')}
      </TradingDropdownItem>

      <TradingDropdownCopyItem value={assetId} text={t('Copy asset ID')} />
      {assetContractAddress && (
        <TradingDropdownItem>
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
        </TradingDropdownItem>
      )}
    </ActionsDropdown>
  );
};
