import { type ApolloClient } from '@apollo/client';
import {
  StopOrderByIdDocument,
  type StopOrderByIdQuery,
  type StopOrderByIdQueryVariables,
} from './__generated__/Orders';

export const waitForStopOrder = (
  stopOrderId: string,
  client: ApolloClient<object>
) =>
  new Promise<StopOrderByIdQuery['stopOrder']>((resolve) => {
    const interval = setInterval(async () => {
      try {
        const res = await client.query<
          StopOrderByIdQuery,
          StopOrderByIdQueryVariables
        >({
          query: StopOrderByIdDocument,
          variables: { stopOrderId },
          fetchPolicy: 'network-only',
        });

        if (res.data) {
          clearInterval(interval);
          resolve(res.data.stopOrder);
        }
      } catch (err) {
        // no op as the query will error until the approval is created
      }
    }, 1000);
  });
