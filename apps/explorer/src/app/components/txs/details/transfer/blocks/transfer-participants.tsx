import { t } from '@vegaprotocol/i18n';
import { Icon, Tooltip } from '@vegaprotocol/ui-toolkit';
import { PartyLink } from '../../../../links';
import {
  SPECIAL_CASE_NETWORK,
  SPECIAL_CASE_NETWORK_ID,
} from '../../../../links/party-link/party-link';
import SizeInAsset from '../../../../size-in-asset/size-in-asset';
import { headerClasses, wrapperClasses } from '../transfer-details';
import type { components } from '../../../../../../types/explorer';

type Transfer = components['schemas']['commandsv1Transfer'];
type AccountTypes = components['schemas']['vegaAccountType'];

const AccountType: Record<AccountTypes, string> = {
  ACCOUNT_TYPE_UNSPECIFIED: 'Unspecified',
  ACCOUNT_TYPE_INSURANCE: 'Insurance',
  ACCOUNT_TYPE_SETTLEMENT: 'Settlement',
  ACCOUNT_TYPE_MARGIN: 'Margin',
  ACCOUNT_TYPE_GENERAL: 'General',
  ACCOUNT_TYPE_FEES_INFRASTRUCTURE: 'Infrastructure',
  ACCOUNT_TYPE_FEES_LIQUIDITY: 'Liquidity',
  ACCOUNT_TYPE_FEES_MAKER: 'Maker',
  ACCOUNT_TYPE_BOND: 'Bond',
  ACCOUNT_TYPE_EXTERNAL: 'External',
  ACCOUNT_TYPE_GLOBAL_INSURANCE: 'Global Insurance',
  ACCOUNT_TYPE_GLOBAL_REWARD: 'Global Reward',
  ACCOUNT_TYPE_PENDING_TRANSFERS: 'Pending Transfers',
  ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES: 'Maker Paid Fees',
  ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES: 'Maker Received Fees',
  ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES: 'LP Received Fees',
  ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS: 'Market Proposers',
  ACCOUNT_TYPE_HOLDING: 'Holding',
};

interface TransferParticipantsProps {
  transfer: Transfer;
  from: string;
}

/**
 * Renders a box containing the To, From and amount of a
 * transfer. This is shown for all transfers, including
 * recurring and reward transfers.
 *
 * @param transfer A recurring transfer object
 * @param from The sender is not in the transaction, but comes from the Transaction submitter
 */
export function TransferParticipants({
  transfer,
  from,
}: TransferParticipantsProps) {
  // This mapping is required as the global account types require a type to be set, while
  // the underlying protobufs allow for every field to be undefined.
  const fromAcct: AccountTypes =
    transfer.fromAccountType &&
    transfer.fromAccountType !== 'ACCOUNT_TYPE_UNSPECIFIED'
      ? transfer.fromAccountType
      : 'ACCOUNT_TYPE_GENERAL';
  const fromAccountTypeLabel: string = transfer.fromAccountType
    ? AccountType[fromAcct]
    : 'Unknown';

  const toAcct: AccountTypes =
    transfer.toAccountType &&
    transfer.toAccountType !== 'ACCOUNT_TYPE_UNSPECIFIED'
      ? transfer.toAccountType
      : 'ACCOUNT_TYPE_GENERAL';
  const toAccountTypeLabel = transfer.fromAccountType
    ? AccountType[toAcct]
    : 'Unknown';

  return (
    <div className={wrapperClasses}>
      <h2 className={headerClasses}>{t('Transfer')}</h2>
      <div className="relative block rounded-lg py-6 text-center">
        <PartyLink id={from} truncate={true} />
        <Tooltip
          description={
            <p>{`${t('From account')}:  ${fromAccountTypeLabel}`}</p>
          }
        >
          <span>
            <Icon className="ml-3" name={'bank-account'} />
          </span>
        </Tooltip>
        <br />

        {/* This block of divs is used to render the inset arrow containing the transfer amount */}
        <div className="bg-vega-light-200 dark:vega-dark-200 flex items-center justify-center my-4 relative">
          <div className="bg-vega-light-200 dark:bg-vega-dark-200 border w-full pt-5 pb-3 px-3 border-vega-light-200 dark:border-vega-dark-150 relative">
            <div className="text-xs z-20 relative leading-none">
              {transfer.asset ? (
                <SizeInAsset assetId={transfer.asset} size={transfer.amount} />
              ) : null}
            </div>

            {/* Empty divs for the top arrow and the bottom arrow of the transfer inset */}
            <div className="z-10 absolute top-[-1px] left-1/2 w-4 h-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 9"
                className="fill-vega-light-100 dark:fill-black"
              >
                <path d="M0,0L8,9l8,-9Z" />
              </svg>
            </div>
            <div className="z-10 absolute bottom-[-16px] left-1/2 w-4 h-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 9"
                className="fill-vega-light-100 dark:fill-vega-dark-200"
              >
                <path d="M0,0L8,9l8,-9Z" />
              </svg>
            </div>
            {/*
            <div className="z-10 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-4 h-4 dark:border-vega-dark-200 border-vega-light-200 bg-white dark:bg-black border-r border-b"></div>
            <div className="z-10 absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-4 h-4 border-vega-light-200 dark:border-vega-dark-200 bg-vega-light-200 dark:bg-vega-dark-200 border-r border-b"></div>
              */}
          </div>
        </div>

        <TransferRecurringRecipient to={transfer.to} />
        <Tooltip
          description={<p>{`${t('To account')}: ${toAccountTypeLabel}`}</p>}
        >
          <span>
            <Icon className="ml-3" name={'bank-account'} />
          </span>
        </Tooltip>
        <br />
      </div>
    </div>
  );
}

interface TransferRecurringRecipientProps {
  to?: string;
}

/**
 * If the transfer is to 000...000, then this is a transfer to the
 * Rewards Pool rather than the network. This component saves this
 * logic from complicating the To section of the participants block
 *
 * @param markets String[] IDs of markets for this dispatch strategy
 */
export function TransferRecurringRecipient({
  to,
}: TransferRecurringRecipientProps) {
  if (to === SPECIAL_CASE_NETWORK || to === SPECIAL_CASE_NETWORK_ID) {
    return <span>{t('Rewards pool')}</span>;
  } else if (to) {
    return <PartyLink id={to} truncate={true} />;
  }

  // Fallback should not happen
  return null;
}
