import { Routes } from '../../../routes/route-names';
import { Link } from 'react-router-dom';

import type { ComponentProps } from 'react';
import Hash from '../hash';

export type OracleLinkProps = Partial<ComponentProps<typeof Link>> & {
  id: string;
  status?: string;
  hasSeenOracleReports?: boolean;
};

export const OracleLink = ({
  id,
  status,
  hasSeenOracleReports = false,
  children,
  ...props
}: OracleLinkProps) => {
  const bgColour =
    status === 'STATUS_ACTIVE'
      ? 'bg-yellow-100 hover:bg-yellow-200 border-yellow-200'
      : 'bg-gray-100 hover:bg-gray-200 border-gray-200';
  const indicatorColour =
    status === 'STATUS_ACTIVE'
      ? 'bg-yellow-300 hover:bg-yellow-500'
      : 'bg-gray-300 hover:bg-gray-500';

  return (
    <Link
      className={`pl-2 pr-2 font-mono dark:text-black ${bgColour} rounded-sm border-solid border-2 relative`}
      {...props}
      to={`/${Routes.ORACLES}/${id}`}
    >
      <Hash text={id} truncate={true} />
      {hasSeenOracleReports ? (
        <strong
          className={`absolute top-0 right-0 w-1 h-full font-thin ${indicatorColour}`}
          title="Oracle has matched data"
        ></strong>
      ) : null}
    </Link>
  );
};

export default OracleLink;
