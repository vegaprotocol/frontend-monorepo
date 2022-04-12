import { Callout, Intent } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Routes } from '../router-config';
import type { StakeAction } from './staking-form';
import { Actions, RemoveType } from './staking-form';

interface StakeSuccessProps {
  action: StakeAction;
  amount: string;
  nodeName: string;
  removeType: RemoveType;
}

export const StakeSuccess = ({
  action,
  amount,
  nodeName,
  removeType,
}: StakeSuccessProps) => {
  const { t } = useTranslation();
  const isAdd = action === Actions.Add;
  const title = isAdd
    ? t('stakeAddSuccessTitle', { amount })
    : t('stakeRemoveSuccessTitle', { amount, node: nodeName });
  const message = isAdd
    ? t('stakeAddSuccessMessage')
    : removeType === RemoveType.EndOfEpoch
    ? t('stakeRemoveSuccessMessage')
    : t('stakeRemoveNowSuccessMessage');

  return (
    <Callout iconName="tick" intent={Intent.Success} title={title}>
      <div>
        <p>{message}</p>
        <p>
          <Link to={Routes.STAKING}>{t('backToStaking')}</Link>
        </p>
      </div>
    </Callout>
  );
};
