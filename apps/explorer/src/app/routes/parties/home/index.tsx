import React from 'react';
import { RouteTitle } from '../../../components/route-title';
import { Input, Button } from '@vegaprotocol/ui-toolkit';

import { useNavigate } from 'react-router-dom';
import { Routes } from '../../router-config';

export const JumpToParty = () => {
  const navigate = useNavigate();

  const handleSubmit = React.useCallback(
    () => (e: React.SyntheticEvent) => {
      e.preventDefault();

      const target = e.target as typeof e.target & {
        partyId: { value: number };
      };

      const partyId = target.partyId.value;

      if (partyId) {
        navigate(`/${Routes.PARTIES}/${partyId}`);
      }
    },
    [navigate]
  );

  return (
    <form onSubmit={handleSubmit}>
      <label
        htmlFor="block-input"
        className="block uppercase text-h5 font-bold mb-4"
      >
        Go to party
      </label>
      <div className="flex">
        <Input
          id="block-input"
          name="partyId"
          placeholder="Party id"
          className="max-w-[200px]"
        />
        <Button variant="secondary" type="submit">
          Go
        </Button>
      </div>
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
