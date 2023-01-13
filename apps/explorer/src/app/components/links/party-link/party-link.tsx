import { Routes } from '../../../routes/route-names';
import { Link } from 'react-router-dom';

import type { ComponentProps } from 'react';

export type PartyLinkProps = Partial<ComponentProps<typeof Link>> & {
  id: string;
};

const PartyLink = ({ id, ...props }: PartyLinkProps) => {
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
