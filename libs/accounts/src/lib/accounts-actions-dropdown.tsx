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
          key={'breakdown'}
          data-testid="breakdown"
          onClick={onClickBreakdown}
        >
          <span>
            <VegaIcon name={VegaIconNames.BREAKDOWN} size={16} />
            {t('Breakdown')}
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
