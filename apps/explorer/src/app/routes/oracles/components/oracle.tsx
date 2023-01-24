import { t } from '@vegaprotocol/react-helpers';
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
  dataConnection: ExplorerOracleDataConnectionFragment;
  showBroadcasts?: boolean;
}

export const OracleDetails = ({
  id,
  dataSource,
  dataConnection,
  showBroadcasts = false,
}: OracleDetailsProps) => {
  const sourceType = dataSource.dataSourceSpec.spec.data.sourceType;
  const reportsCount: number = dataConnection.dataConnection.edges?.length || 0;

  return (
    <div>
      <TableWithTbody>
        <TableRow modifier="bordered">
          <TableHeader scope="row">{t('ID')}</TableHeader>
          <TableCell modifier="bordered">
            <OracleLink id={id} />
          </TableCell>
        </TableRow>
        <OracleDetailsType type={sourceType.__typename} />
        <OracleSigners sourceType={sourceType} />
        <OracleMarkets id={id} />
        {showBroadcasts ? (
          <TableRow modifier="bordered">
            <TableHeader scope="row">{t('Broadcasts')}</TableHeader>
            <TableCell modifier="bordered">{reportsCount}</TableCell>
          </TableRow>
        ) : null}
      </TableWithTbody>
      <OracleFilter data={dataSource} />
      <OracleData data={dataConnection} />
    </div>
  );
};
