import { type v2ListTeamsResponse } from '@vegaprotocol/rest-clients/dist/trading-data';
import { useEffect, useMemo } from 'react';

import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { useAsyncAction } from '@/hooks/async-action';
import { RpcMethods } from '@/lib/client-rpc-methods';

import { AsyncRenderer } from '../async-renderer';
import { TeamLink } from './team-link';

export const VegaTeam = ({ id }: { id: string }) => {
  const { request } = useJsonRpcClient();
  const load = useMemo(
    () => () =>
      request(RpcMethods.Fetch, { path: `api/v2/teams?teamId=${id}` }, true),
    [id, request]
  );
  const { loading, error, data, loaderFunction } =
    useAsyncAction<v2ListTeamsResponse>(load);
  useEffect(() => {
    loaderFunction();
  }, [loaderFunction]);

  return (
    <AsyncRenderer
      loading={loading}
      error={error}
      errorView={() => <TeamLink id={id} />}
      renderLoading={() => <TeamLink id={id} />}
      render={() => (
        <TeamLink id={id}>{data?.teams?.edges?.[0].node?.name}</TeamLink>
      )}
    />
  );
};
