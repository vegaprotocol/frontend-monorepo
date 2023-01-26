import { Routes } from '../../../routes/route-names';
import { Link } from 'react-router-dom';

import type { ComponentProps } from 'react';

export type OracleLinkProps = Partial<ComponentProps<typeof Link>> & {
  id: string;
};

const OracleLink = ({ id, ...props }: OracleLinkProps) => {
  return (
    <Link
      className="underline font-mono"
      {...props}
      to={`/${Routes.ORACLES}/${id}`}
    >
      {id}
    </Link>
  );
};

export default OracleLink;
