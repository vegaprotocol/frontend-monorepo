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
import { getAddressesOrNothing, OracleSigners } from './oracle-signers';
import { OracleEthSource } from './oracle-eth-source';
import Hash from '../../../components/links/hash';
import { getStatusString } from '../../../components/links/oracle-link/oracle-link';
import { useOracleProofs, OracleBranding } from '@vegaprotocol/markets';
import { ENV } from '../../../config/env';
import { OracleVerifiedStatusIcon } from './oracle-verified-status-icon';

const brandedOracles = ['PYTH', 'UMA'];

export type SourceType =
  ExplorerOracleDataSourceFragment['dataSourceSpec']['spec']['data']['sourceType'];

export type OracleProofs = ReturnType<typeof useOracleProofs>;
export type OracleProofData = OracleProofs['data'];

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
  const ORACLE_PROOFS_URL = ENV.dataSources.oracleProofsUrl;
  const { data } = useOracleProofs(ORACLE_PROOFS_URL);

  const sourceType = dataSource.dataSourceSpec.spec.data.sourceType;
  const chain =
    dataSource.dataSourceSpec.spec.data.sourceType.sourceType.__typename ===
    'EthCallSpec'
      ? dataSource.dataSourceSpec.spec.data.sourceType.sourceType.sourceChainId.toString()
      : undefined;

  const requiredConfirmations =
    (sourceType.sourceType.__typename === 'EthCallSpec' &&
      sourceType.sourceType.requiredConfirmations) ||
    '';

  const address = getAddressesOrNothing(sourceType);
  const proof = address ? getOracleDetailsFromProviders(address, data) : null;

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
        <OracleMarkets id={id} />
        <OracleSigners sourceType={sourceType} />
        <OracleEthSource sourceType={sourceType} chain={chain} />
        <TableRow modifier="bordered">
          <TableHeader scope="row" className="pt-1 align-text-top">
            {t('Filter')}
          </TableHeader>
          <TableCell modifier="bordered">
            <OracleFilter data={dataSource} />
          </TableCell>
        </TableRow>
        {requiredConfirmations && requiredConfirmations > 0 && (
          <TableRow modifier="bordered">
            <TableHeader scope="row">{t('Required Confirmations')}</TableHeader>
            <TableCell modifier="bordered">{requiredConfirmations}</TableCell>
          </TableRow>
        )}
        {!!data && !!proof && (
          <>
            {proof?.type && brandedOracles.indexOf(proof.type) !== -1 && (
              <TableRow modifier="bordered">
                <TableHeader scope="row">{t('Provider')}</TableHeader>
                <TableCell modifier="bordered">
                  <OracleBranding type={proof.type} />
                </TableCell>
              </TableRow>
            )}
            {proof && (
              <TableRow modifier="bordered">
                <TableHeader scope="row">{t('Status')}</TableHeader>
                <TableCell modifier="bordered">
                  <OracleVerifiedStatusIcon provider={proof} />
                </TableCell>
              </TableRow>
            )}
          </>
        )}
      </TableWithTbody>
      {dataConnection ? <OracleData data={dataConnection} /> : null}
    </div>
  );
};

export function getOracleDetailsFromProviders(
  originAddress: string,
  providers?: OracleProofData
) {
  const oracleDetails = providers?.find((provider) => {
    switch (provider.oracle.type) {
      case 'eth_address':
        return provider.oracle.eth_address === originAddress;
      default:
        return false;
    }
  });

  return oracleDetails;
}
