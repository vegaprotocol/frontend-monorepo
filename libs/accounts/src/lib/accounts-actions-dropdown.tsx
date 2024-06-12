import { ETHERSCAN_ADDRESS, useEtherscanLink } from '@vegaprotocol/environment';
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
  assetId,
  assetContractAddress,
  onClickBreakdown,
}: {
  assetId: string;
  assetContractAddress?: string;
  onClickBreakdown: () => void;
}) => {
  const etherscanLink = useEtherscanLink();
  const openAssetDialog = useAssetDetailsDialogStore((store) => store.open);
  const t = useT();
  return (
    <ActionsDropdown>
      <TradingDropdownItem
        key={'breakdown'}
        data-testid="breakdown"
        onClick={onClickBreakdown}
      >
        <VegaIcon name={VegaIconNames.BREAKDOWN} size={16} />
        {t('View usage breakdown')}
      </TradingDropdownItem>
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
              <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={16} />
              {t('View on Etherscan')}
            </span>
          </Link>
        </TradingDropdownItem>
      )}
    </ActionsDropdown>
  );
};
