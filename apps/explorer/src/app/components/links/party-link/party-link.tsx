import React from 'react';
import { Routes } from '../../../routes/route-names';
import { Link } from 'react-router-dom';

import type { ComponentProps } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { isValidPartyId } from '../../../routes/parties/id/components/party-id-error';

export type PartyLinkProps = Partial<ComponentProps<typeof Link>> & {
  id: string;
};

const PartyLink = ({ id, ...props }: PartyLinkProps) => {
  if (!isValidPartyId(id)) {
    return (
      <span className="text-vega-pink-dark font-bold" title={id}>
        {t('Invalid Vega address')}
      </span>
    );
  }
  return (
    <Link
      className="underline font-mono"
      {...props}
      to={`/${Routes.PARTIES}/${id}`}
    >
      {id}
    </Link>
  );
};

export default PartyLink;
