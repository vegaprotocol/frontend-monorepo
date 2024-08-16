import { Squid } from '@0xsquid/sdk';
import { type ReactNode, useRef, useEffect, useState } from 'react';

/**
 * Sets up a reference to the squid sdk
 */
export const SquidContainer = ({
  children,
  integratorId,
  apiUrl,
}: {
  children: (squid: Squid) => ReactNode;
  integratorId: string;
  apiUrl: string;
}) => {
  const [ready, setReady] = useState(false);
  const squidRef = useRef(
    new Squid({
      baseUrl: apiUrl,
      integratorId,
    })
  );

  useEffect(() => {
    const run = async () => {
      try {
        await squidRef.current.init();
        setReady(true);
      } catch (err) {
        console.error(err);
      }
    };

    run();
  });

  if (!ready) return null;

  return children(squidRef.current);
};
