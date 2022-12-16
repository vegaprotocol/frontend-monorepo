import type { Account } from './accounts-data-provider';
import * as Schema from '@vegaprotocol/types';

interface Props {
  accounts: Account[] | null;
  marketId: string;
}

export const getMarketAccount = ({ accounts, marketId }: Props) =>
  accounts?.find((account) => {
    return (
      account.market?.id === marketId &&
      account.type === Schema.AccountType.ACCOUNT_TYPE_MARGIN
    );
  }) || null;
