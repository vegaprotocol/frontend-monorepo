import React from 'react';
import { Routes } from '../../../routes/route-names';
import { Link } from 'react-router-dom';

export type PartyLinkProps = {
  id: string;
};

const PartyLink = ({ id, ...props }: PartyLinkProps) => {
  return (
    <Link className="underline" to={`/${Routes.PARTIES}/${id}`} {...props}>
      {id}
    </Link>
  );
};

export default PartyLink;
