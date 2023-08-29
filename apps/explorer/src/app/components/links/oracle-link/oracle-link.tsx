import { Routes } from '../../../routes/route-names';
import { Link } from 'react-router-dom';
import type { OracleSpecEdge } from '@vegaprotocol/types';

import type { ComponentProps } from 'react';
import Hash from '../hash';

function hasOracleSeenReports(
  data: OracleSpecEdge[],
  oracleId: string
): boolean {
  const node = data
    .filter((o) => o.node.dataSourceSpec.spec.id === oracleId)
    .at(0);

  if (!node) {
    return false;
  }

  const count = node.node.dataConnection.edges?.length || 0;

  return count > 0;
}

export type OracleLinkProps = Partial<ComponentProps<typeof Link>> & {
  id: string;
  status?: string;
  data: OracleSpecEdge[];
};

const OracleLink = ({
  id,
  status,
  data,
  children,
  ...props
}: OracleLinkProps) => {
  const d = hasOracleSeenReports(data, id);

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
      {d ? (
        <strong
          className={`absolute top-0 right-0 w-1 h-full font-thin ${indicatorColour}`}
          title="Oracle has matched data"
        ></strong>
      ) : null}
    </Link>
  );
};

export default OracleLink;
