import React from 'react';
import { RouteTitle } from '../../../components/route-title';

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
    <form onSubmit={handleSubmit}>
      <label
        htmlFor="block-input"
        className="block uppercase text-h5 font-bold"
      >
        Go to party
      </label>
      <input
        id="block-input"
        name="partyId"
        placeholder="Party id"
        className="bg-white-25 border-white border px-8 py-4 placeholder-white-60"
      />
      <input
        className="border-white border px-28 py-4 cursor-pointer"
        type="submit"
        value="Go"
      />
    </form>
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
