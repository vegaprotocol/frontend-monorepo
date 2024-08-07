import { useParams } from 'react-router-dom';

import { BasePage } from '@/components/pages/page';
import { FULL_ROUTES } from '@/routes/route-names';
import { useConnectionStore } from '@/stores/connections';

import { AutomaticConsentSection } from './sections/automatic-consent';
import { DeleteConnectionSection } from './sections/delete-connection';
import { DetailsSection } from './sections/details-list';

export const locators = {
  connectionDetails: 'connection-details',
};

const getTitle = (origin: string) => {
  try {
    const url = new URL(origin);
    return url.hostname;
  } catch {
    return origin;
  }
};

interface Params extends Record<string, string> {
  id: string;
}

export const ConnectionDetails = () => {
  const { id } = useParams<Params>();
  if (!id) throw new Error('Id param not provided to connection details');

  const { connections, loading } = useConnectionStore((state) => ({
    connections: state.connections,
    loading: state.loading,
  }));
  const connectionOrigin = decodeURI(id);
  if (loading) return null;

  const connection = connections.find((c) => c.origin === connectionOrigin);
  if (!connection)
    {throw new Error(
      `Could not find connection with origin ${connectionOrigin}`
    );}

  return (
    <BasePage
      backLocation={FULL_ROUTES.connections}
      dataTestId={locators.connectionDetails}
      title={getTitle(connection.origin)}
    >
      <DetailsSection connection={connection} />
      <AutomaticConsentSection connection={connection} />
      <DeleteConnectionSection connection={connection} />
    </BasePage>
  );
};
