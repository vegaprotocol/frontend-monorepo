import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type { OracleSpecDataConnectionQuery } from './__generated__/OracleSpecDataConnection';
import type { OracleData } from '@vegaprotocol/types';

export function createDataConnection(
  override?: PartialDeep<OracleData>
): OracleData {
  const defaultDataConnection = {
    externalData: {
      data: {
        broadcastAt: new Date().toISOString(),
        data: [
          {
            name: 'settlement-data-property',
            value: '100',
          },
        ],
      },
    },
  };

  return merge(defaultDataConnection, override);
}

export function oracleSpecDataConnectionQuery(
  override?: PartialDeep<OracleSpecDataConnectionQuery>
): OracleSpecDataConnectionQuery {
  const defaultResult = {
    oracleSpec: {
      dataConnection: {
        edges: [{ node: createDataConnection() }],
      },
    },
  };

  return merge(defaultResult, override);
}
