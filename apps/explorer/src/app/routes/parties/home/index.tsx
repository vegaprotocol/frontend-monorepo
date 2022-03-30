import React from 'react';
import { RouteTitle } from '../../../components/route-title';
import { JumpTo } from '../../../components/jump-to';

import { useNavigate } from 'react-router-dom';
import { Routes } from '../../router-config';

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
      label="Go to party"
      placeholder="Party id"
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
      <RouteTitle data-testid="parties-header">Parties</RouteTitle>
      <JumpToParty />
    </section>
  );
};

export { Parties };
