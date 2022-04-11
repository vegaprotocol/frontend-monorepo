import React from 'react';
import { RouteTitle } from '../../../components/route-title';
import { JumpTo } from '../../../components/jump-to';

import { useNavigate } from 'react-router-dom';
import { Routes } from '../../route-names';
import { t } from '@vegaprotocol/react-helpers';

export const JumpToParty = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      partyId: { value: number };
    };

    const partyId = target.partyId.value;

    if (partyId) {
      navigate(`/${Routes.PARTIES}/${partyId}`);
    }
  };
  return (
    <JumpTo
      label={t('Go to party')}
      placeholder={t('Party id')}
      inputId="party-input"
      inputType="text"
      inputName="partyId"
      submitHandler={handleSubmit}
    />
  );
};

const Parties = () => {
  return (
    <section>
      <RouteTitle data-testid="parties-header">{t('Parties')}</RouteTitle>
      <JumpToParty />
    </section>
  );
};

export { Parties };
