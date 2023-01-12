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

export type SourceType =
  ExplorerOracleDataSourceFragment['dataSourceSpec']['spec']['data']['sourceType'];

interface OracleDetailsProps {
  id: string;
  dataSource: ExplorerOracleDataSourceFragment;
  dataConnection: ExplorerOracleDataConnectionFragment;
}

export const OracleDetails = ({
  id,
  dataSource,
  dataConnection,
}: OracleDetailsProps) => {
  const sourceType = dataSource.dataSourceSpec.spec.data.sourceType;
  const reportsCount: number = dataConnection.dataConnection.edges?.length || 0;

  return (
    <div>
      <TableWithTbody>
        <TableRow modifier="bordered">
          <TableHeader scope="row">{t('ID')}</TableHeader>
          <TableCell modifier="bordered">{id}</TableCell>
        </TableRow>
        <OracleDetailsType type={sourceType.__typename} />
        {
          // Disabled until https://github.com/vegaprotocol/vega/issues/7286 is released
          /*<OracleSigners sourceType={sourceType} />*/
        }
        <OracleMarkets id={id} />
        <TableRow modifier="bordered">
          <TableHeader scope="row">{t('Broadcasts')}</TableHeader>
          <TableCell modifier="bordered">{reportsCount}</TableCell>
        </TableRow>
      </TableWithTbody>
      <OracleFilter data={dataSource} />
      <OracleData data={dataConnection} />
    </div>
  );
};
