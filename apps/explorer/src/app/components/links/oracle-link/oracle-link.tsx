import { Routes } from '../../../routes/route-names';
import { Link } from 'react-router-dom';

import type { ComponentProps } from 'react';
import Hash from '../hash';

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
      <Hash text={id} />
    </Link>
  );
};

export default OracleLink;
