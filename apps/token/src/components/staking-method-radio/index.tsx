import { RadioGroup, RadioItem } from '@vegaprotocol/ui-toolkit';
import React from 'react';
import { useTranslation } from 'react-i18next';

export enum StakingMethod {
  Contract = 'Contract',
  Wallet = 'Wallet',
}

export const StakingMethodRadio = ({
  setSelectedStakingMethod,
  selectedStakingMethod,
}: {
  selectedStakingMethod: StakingMethod | null;
  setSelectedStakingMethod: React.Dispatch<
    React.SetStateAction<StakingMethod | null>
  >;
}) => {
  const { t } = useTranslation();
  return (
    <RadioGroup
      onChange={(value) => {
        setSelectedStakingMethod(value as StakingMethod);
      }}
      value={selectedStakingMethod || undefined}
    >
      <RadioItem
        id="associate-radio-contract"
        label={t('Vesting contract')}
        value={StakingMethod.Contract}
      />
      <RadioItem
        id="associate-radio-wallet"
        label={t('Wallet')}
        value={StakingMethod.Wallet}
      />
    </RadioGroup>
  );
};
