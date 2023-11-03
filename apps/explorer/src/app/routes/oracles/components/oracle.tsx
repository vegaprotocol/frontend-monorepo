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
import { OracleEthSource } from './oracle-eth-source';
import Hash from '../../../components/links/hash';
import { getStatusString } from '../../../components/links/oracle-link/oracle-link';

export type SourceType =
  ExplorerOracleDataSourceFragment['dataSourceSpec']['spec']['data']['sourceType'];

interface OracleDetailsProps {
  id: string;
  dataSource: ExplorerOracleDataSourceFragment;
  dataConnection: ExplorerOracleDataConnectionFragment['dataConnection'];
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
}: OracleDetailsProps) => {
  const sourceType = dataSource.dataSourceSpec.spec.data.sourceType;

  return (
    <div>
      <TableWithTbody className="mb-2">
        <TableRow modifier="bordered">
          <TableHeader scope="row">{t('ID')}</TableHeader>
          <TableCell modifier="bordered">
            <Hash text={id} />
          </TableCell>
        </TableRow>
        <OracleDetailsType sourceType={sourceType} />
        <TableRow modifier="bordered">
          <TableHeader scope="row">{t('Status')}</TableHeader>
          <TableCell modifier="bordered">
            {getStatusString(dataSource.dataSourceSpec.spec.status)}
          </TableCell>
        </TableRow>
        <OracleSigners sourceType={sourceType} />
        <OracleEthSource sourceType={sourceType} />
        <OracleMarkets id={id} />
        <TableRow modifier="bordered">
          <TableHeader scope="row">{t('Filter')}</TableHeader>
          <TableCell modifier="bordered">
            <OracleFilter data={dataSource} />
          </TableCell>
        </TableRow>
      </TableWithTbody>
      {dataConnection ? <OracleData data={dataConnection} /> : null}
    </div>
  );
};
