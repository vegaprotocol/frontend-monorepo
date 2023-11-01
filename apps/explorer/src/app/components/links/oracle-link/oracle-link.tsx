import { Routes } from '../../../routes/route-names';
import { Link } from 'react-router-dom';

import type { ComponentProps } from 'react';
import Hash from '../hash';
import { Tooltip, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import {
  DataSourceSpecStatus,
  DataSourceSpecStatusMapping,
} from '@vegaprotocol/types';
import { t } from '@vegaprotocol/i18n';

/**
 * Returns a human-readable string for the given status, or a meaningful
 * default if the status is unrecognised
 * @param status string status
 */
export function getStatusString(status: string | undefined): string {
  if (status && status in DataSourceSpecStatus) {
    return DataSourceSpecStatusMapping[status as DataSourceSpecStatus];
  }

  return t('Unknown');
}

export type OracleLinkProps = Partial<ComponentProps<typeof Link>> & {
  // The Oracle ID
  id: string;
  // If available, the oracle status
  status?: string;
  // If the oracle has corresponding data in the OracleDataConnection
  hasSeenOracleReports?: boolean;
};

/**
 * Given an Oracle ID, renders a data-dense link to the Oracle page. Data density is achieved by:
 * - Colour coding the link based on the Oracle's status
 * - Showing a small indicator if the Oracle has matched data
 * - Showing a tooltip with the Oracle's status and whether it has matched data
 *
 * @returns
 */
export const OracleLink = ({
  id,
  status,
  hasSeenOracleReports = false,
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
