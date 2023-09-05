import { t } from '@vegaprotocol/i18n';
import {
  TableRow,
  TableCell,
  TableWithTbody,
  TableHeader,
} from '../../../components/table';
import type {
  ExplorerOracleDataConnectionFragment,
  ExplorerOracleDataSourceFragment,
} from '../__generated__/Oracles';
import { OracleData } from './oracle-data';
import { OracleFilter } from './oracle-filter';
import { OracleDetailsType } from './oracle-details-type';
import { OracleMarkets } from './oracle-markets';
import { OracleSigners } from './oracle-signers';
import OracleLink from '../../../components/links/oracle-link/oracle-link';

export type SourceType =
  ExplorerOracleDataSourceFragment['dataSourceSpec']['spec']['data']['sourceType'];

interface OracleDetailsProps {
  id: string;
  dataSource: ExplorerOracleDataSourceFragment;
  dataConnection?: ExplorerOracleDataConnectionFragment;
  // Defaults to false. Hides the count of 'broadcasts' this oracle has seen
  showBroadcasts?: boolean;
}

/**
 * Notes:
 * - Matched data is really 'Data that matched this oracle' and given oracles are unique
 *   to each market, and each serves either as trading termination or settlement, really
 *   they will only ever see 1 match (most likely). So it should be more like 'Has seen
 *   data' vs 'Has not yet seen data'
 */
export const OracleDetails = ({
  id,
  dataSource,
  dataConnection,
  showBroadcasts = false,
}: OracleDetailsProps) => {
  const sourceType = dataSource.dataSourceSpec.spec.data.sourceType;
  const reportsCount: number =
    dataConnection?.dataConnection.edges?.length || 0;

  return (
    <div>
      <TableWithTbody className="mb-2">
        <TableRow modifier="bordered">
          <TableHeader scope="row">{t('ID')}</TableHeader>
          <TableCell modifier="bordered">
            <OracleLink id={id} />
          </TableCell>
        </TableRow>
        <OracleDetailsType sourceType={sourceType} />
        <OracleSigners sourceType={sourceType} />
        <OracleMarkets id={id} />
        <TableRow modifier="bordered">
          <TableHeader scope="row">{t('Matched data')}</TableHeader>
          <TableCell modifier="bordered">
            {showBroadcasts ? reportsCount : reportsCount > 0 ? '✅' : '❌'}
          </TableCell>
        </TableRow>
      </TableWithTbody>
      <OracleFilter data={dataSource} />
      {showBroadcasts && dataConnection ? (
        <OracleData data={dataConnection} />
      ) : null}
    </div>
  );
};
