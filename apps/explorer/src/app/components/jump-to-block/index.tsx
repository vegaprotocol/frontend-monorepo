import { t } from '@vegaprotocol/react-helpers';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../routes/route-names';
import { JumpTo } from '../jump-to';

export const JumpToBlock = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      blockNumber: { value: number };
    };

    const blockNumber = target.blockNumber.value;

    if (blockNumber) {
      navigate(`/${Routes.BLOCKS}/${blockNumber}`);
    }
  };

  return (
    <JumpTo
      label={t('Jump to block')}
      placeholder={t('Block number')}
      inputId="block-input"
      inputType="number"
      inputName="blockNumber"
      submitHandler={handleSubmit}
      inputMin={0}
    />
  );
};
