import { DApp, EXPLORER_ORACLE, useLinks } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import { MarketState } from '@vegaprotocol/types';
import { Link } from '@vegaprotocol/ui-toolkit';
import { formatDistanceToNowStrict, isAfter } from 'date-fns';

export interface SettlementDataCellProps {
  oracleSpecId: string;
  metaDate: Date | null;
  closeTimestamp: string | null;
  marketState: MarketState;
}

export const SettlementDateCell = ({
  oracleSpecId,
  metaDate,
  closeTimestamp,
  marketState,
}: SettlementDataCellProps) => {
  const linkCreator = useLinks(DApp.Explorer);
  const date = closeTimestamp ? new Date(closeTimestamp) : metaDate;

  let text = '';
  if (!date) {
    text = t('Unknown');
  } else {
    // pass Date.now() to date constructor for easier mocking
    const expiryHasPassed = isAfter(new Date(Date.now()), date);
    const distance = formatDistanceToNowStrict(date); // X days/mins ago

    if (expiryHasPassed) {
      if (marketState !== MarketState.STATE_SETTLED) {
        text = t('Expected %s ago', distance);
      } else {
        text = t('%s ago', distance);
      }
    } else {
      text = t('Expected in %s', distance);
    }
  }

  return (
    <Link
      href={linkCreator(EXPLORER_ORACLE.replace(':id', oracleSpecId))}
      className="underline"
      target="_blank"
    >
      {text}
    </Link>
  );
};
