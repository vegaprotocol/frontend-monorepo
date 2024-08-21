import { Squid } from '@0xsquid/sdk';
import { useQuery } from '@tanstack/react-query';
import { useEnvironment } from '@vegaprotocol/environment';

export const useSquid = () => {
  const { SQUID_INTEGRATOR_ID, SQUID_API_URL } = useEnvironment();

  const queryResult = useQuery({
    queryKey: ['squid'],
    queryFn: async () => {
      if (!SQUID_INTEGRATOR_ID) {
        throw new Error('no squid integrator id');
      }

      if (!SQUID_API_URL) {
        throw new Error('no squid api url');
      }

      const squid = new Squid({
        baseUrl: SQUID_API_URL,
        integratorId: SQUID_INTEGRATOR_ID,
      });

      await squid.init();

      return squid;
    },
  });

  return queryResult;
};
