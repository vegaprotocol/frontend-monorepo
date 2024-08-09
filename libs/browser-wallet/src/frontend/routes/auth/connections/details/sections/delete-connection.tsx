import { Button, Intent } from '@vegaprotocol/ui-toolkit';
import { useNavigate } from 'react-router-dom';

import { VegaSection } from '@/components/vega-section';
import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { useAsyncAction } from '@/hooks/async-action';
import { FULL_ROUTES } from '@/routes/route-names';
import { useConnectionStore } from '@/stores/connections';
import type { Connection } from '@/types/backend';

export const locators = {
  removeConnection: 'remove-connection',
};

export const DeleteConnectionSection = ({
  connection,
}: {
  connection: Connection;
}) => {
  const { request } = useJsonRpcClient();
  const { removeConnection, loading } = useConnectionStore((state) => ({
    removeConnection: state.removeConnection,
    loading: state.loading,
  }));
  const navigate = useNavigate();
  const {
    loading: removingConnection,
    loaderFunction,
    error,
  } = useAsyncAction(async () => {
    await navigate(FULL_ROUTES.connections);
    await removeConnection(request, connection);
  });

  if (error) throw error;
  if (loading || removingConnection) return null;
  return (
    <VegaSection>
      <form
        onSubmit={(event_) => {
          event_.preventDefault();
          loaderFunction();
        }}
      >
        <Button
          data-testid={locators.removeConnection}
          type="submit"
          className="w-full mb-6"
          intent={Intent.Secondary}
        >
          Remove connection
        </Button>
      </form>
    </VegaSection>
  );
};
