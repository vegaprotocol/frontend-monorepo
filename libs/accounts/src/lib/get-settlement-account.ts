import type { Account } from './accounts-data-provider';
import { Schema } from '@vegaprotocol/types';

interface Props {
  accounts: Account[] | null;
  assetId: string;
}

export const getSettlementAccount = ({ accounts, assetId }: Props) =>
  accounts?.find((account) => {
    return (
      account.asset.id === assetId &&
      account.type === Schema.AccountType.ACCOUNT_TYPE_GENERAL
    );
  }) || null;
