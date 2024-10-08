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
import {
  type AssetFieldsFragment,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';

export const AccountsActionsDropdown = (props: {
  isReadOnly?: boolean;
  asset: AssetFieldsFragment;
  onClickDeposit: () => void;
  onClickCrossChainDeposit?: () => void;
  onClickWithdraw: () => void;
  onClickTransfer: () => void;
  onClickSwap: () => void;
}) => {
  const etherscanLink = useExternalExplorerLink(
    props.asset.source.__typename === 'ERC20'
      ? Number(props.asset.source.chainId)
      : undefined
  );
  const openAssetDialog = useAssetDetailsDialogStore((store) => store.open);
  const t = useT();
  return (
    <ActionsDropdown vertical>
      {props.isReadOnly ? null : (
        <>
          <DropdownMenuItem
            key={'deposit'}
            data-testid="deposit"
            onClick={props.onClickDeposit}
          >
            <VegaIcon name={VegaIconNames.DEPOSIT} size={16} />
            {t('Deposit')}
          </DropdownMenuItem>
          {props.onClickCrossChainDeposit && (
            <DropdownMenuItem
              key={'deposit'}
              data-testid="deposit"
              onClick={props.onClickCrossChainDeposit}
            >
              <VegaIcon name={VegaIconNames.DEPOSIT} size={16} />
              {t('Cross-chain deposit')}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            key={'withdraw'}
            data-testid="withdraw"
            onClick={props.onClickWithdraw}
          >
            <VegaIcon name={VegaIconNames.WITHDRAW} size={16} />
            {t('Withdraw')}
          </DropdownMenuItem>
          <DropdownMenuItem
            key={'transfer'}
            data-testid="transfer"
            onClick={props.onClickTransfer}
          >
            <VegaIcon name={VegaIconNames.TRANSFER} size={16} />
            {t('Transfer')}
          </DropdownMenuItem>
          <DropdownMenuItem
            key={'swap'}
            data-testid="swap"
            onClick={props.onClickSwap}
          >
            <VegaIcon name={VegaIconNames.SWAP} size={16} />
            {t('Swap')}
          </DropdownMenuItem>
        </>
      )}
      <DropdownMenuItem
        onClick={(e) => {
          openAssetDialog(props.asset.id, e.target as HTMLElement);
        }}
      >
        <VegaIcon name={VegaIconNames.INFO} size={16} />
        {t('View asset details')}
      </DropdownMenuItem>

      <DropdownMenuCopyItem value={props.asset.id} text={t('Copy asset ID')} />
      {props.asset.source.__typename === 'ERC20' && (
        <DropdownMenuItem>
          <Link
            href={etherscanLink(
              ETHERSCAN_ADDRESS.replace(
                ':hash',
                props.asset.source.contractAddress
              )
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
