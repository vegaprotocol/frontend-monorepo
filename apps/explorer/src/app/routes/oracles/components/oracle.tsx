import { getNodes, t } from '@vegaprotocol/react-helpers';
import { Loader } from '@vegaprotocol/ui-toolkit';
import { MarketLink, PartyLink } from '../../../components/links';
import {
  EthExplorerLink,
  EthExplorerLinkTypes,
} from '../../../components/links/eth-explorer-link/eth-explorer-link';
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
import type { ExplorerOracleForMarketsMarketFragment } from '../__generated__/OraclesForMarkets';
import { useExplorerOracleFormMarketsQuery } from '../__generated__/OraclesForMarkets';

type SourceType =
  ExplorerOracleDataSourceFragment['dataSourceSpec']['spec']['data']['sourceType'];
type SourceTypeName = SourceType['__typename'] | undefined;

interface OracleDetailsTypeProps {
  type: SourceTypeName;
}

export function OracleDetailsType({ type }: OracleDetailsTypeProps) {
  return (
    <TableRow modifier="bordered">
      <TableHeader scope="row">Type</TableHeader>
      <TableCell modifier="bordered">
        {type === 'DataSourceDefinitionInternal'
          ? 'Internal time'
          : 'External data'}
      </TableCell>
    </TableRow>
  );
}

interface OracleDetailsSignersProps {
  sourceType: SourceType;
}

export function OracleSigners({ sourceType }: OracleDetailsSignersProps) {
  if (sourceType.__typename !== 'DataSourceDefinitionExternal') {
    return null;
  }
  const signers = sourceType.sourceType.signers;

  if (!signers || signers.length === 0) {
    return null;
  }

  return (
    <>
      {signers.map((s) => {
        let key;
        switch (s.signer.__typename) {
          case 'ETHAddress':
            if (s.signer.address) {
              key = (
                <span>
                  ETH:{' '}
                  <EthExplorerLink
                    id={s.signer.address}
                    type={EthExplorerLinkTypes.address}
                  />
                </span>
              );
            }
            break;
          case 'PubKey':
            if (s.signer.key) {
              key = (
                <span>
                  Vega: <PartyLink id={s.signer.key} />
                </span>
              );
            }
            break;
        }
        return (
          <TableRow modifier="bordered">
            <TableHeader scope="row">Signer</TableHeader>
            <TableCell modifier="bordered">{key}</TableCell>
          </TableRow>
        );
      })}
    </>
  );
}

interface OracleMarketsProps {
  id: string;
}

export function OracleMarkets({ id }: OracleMarketsProps) {
  const { data, loading } = useExplorerOracleFormMarketsQuery({
    fetchPolicy: 'cache-first',
  });

  const markets = getNodes<ExplorerOracleForMarketsMarketFragment>(
    data?.marketsConnection
  );

  if (markets) {
    const m = markets.find((m) => {
      const p = m.tradableInstrument.instrument.product;
      if (
        p.dataSourceSpecForSettlementData.id === id ||
        p.dataSourceSpecForTradingTermination.id === id
      ) {
        return true;
      }
      return false;
    });

    if (m && m.id) {
      const type =
        id ===
        m.tradableInstrument.instrument.product.dataSourceSpecForSettlementData
          .id
          ? 'Settlement for'
          : 'Termination for';
      return (
        <TableRow modifier="bordered">
          <TableHeader scope="row">{type}</TableHeader>
          <TableCell modifier="bordered">
            <MarketLink id={m.id} />
          </TableCell>
        </TableRow>
      );
    }
  }
  return (
    <TableRow modifier="bordered">
      <TableHeader scope="row">{t('Market')}</TableHeader>
      <TableCell modifier="bordered">
        <span>{id}</span>
      </TableCell>
    </TableRow>
  );
}

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
  );
};
