import { getNodes, t } from '@vegaprotocol/react-helpers';
import { useMemo } from 'react';
import type { WithdrawalArgs } from './use-create-withdraw';
import { WithdrawManager } from './withdraw-manager';
import { useWithdrawFormQuery, AssetFieldsFragment } from './__generated__/Withdraw';

interface WithdrawFormContainerProps {
  partyId: string;
  submit: (args: WithdrawalArgs) => void;
}

export const WithdrawFormContainer = ({
  partyId,
  submit,
}: WithdrawFormContainerProps) => {
  const { data, loading, error } = useWithdrawFormQuery({
    variables: { partyId },
  });

  const assets = useMemo(() => {
    return getNodes<AssetFieldsFragment>(data?.assetsConnection);
  }, [data]);

  if (loading || !data) {
    return <div>{t('Loading...')}</div>;
  }

  if (error) {
    return <div>{t('Something went wrong')}</div>;
  }

  return (
    <WithdrawManager
      assets={assets}
      accounts={data.party?.accounts || []}
      submit={submit}
    />
  );
};
