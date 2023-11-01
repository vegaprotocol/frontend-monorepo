import { Routes } from '../../../routes/route-names';
import { Link } from 'react-router-dom';

import type { ComponentProps } from 'react';
import Hash from '../hash';
import { Tooltip, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import {
  DataSourceSpecStatus,
  DataSourceSpecStatusMapping,
} from '@vegaprotocol/types';
import { getTypeString } from '../../../routes/oracles/components/oracle-details-type';

export function getStatusString(status: string | undefined): string {
  if (status && status in DataSourceSpecStatus) {
    return DataSourceSpecStatusMapping[status as DataSourceSpecStatus];
  }

  return 'Unknown';
}

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
      ? 'bg-yellow-100 hover:bg-yellow-200 border-yellow-200 dark:bg-yellow-200 dark:border-yellow-200 dark:text-gray-900 dark:border-yellow-300'
      : 'bg-gray-100 hover:bg-gray-200 border-gray-200';
  const indicatorColour =
    status === 'STATUS_ACTIVE'
      ? 'bg-yellow-300 hover:bg-yellow-500 dark:bg-yellow-500'
      : 'bg-gray-300 hover:bg-gray-500';

  const description = (
    <div>
      <p>
        <strong>{`Status: `}</strong>
        {getStatusString(status)}
      </p>
      <p>
        <strong>{`Matched data: `}</strong>
        {hasSeenOracleReports ? (
          <VegaIcon name={VegaIconNames.TICK} />
        ) : (
          <VegaIcon name={VegaIconNames.CROSS} />
        )}
      </p>
    </div>
  );

  return (
    <Tooltip description={description}>
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
    </Tooltip>
  );
};

export default OracleLink;
