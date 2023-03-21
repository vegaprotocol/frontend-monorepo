import { useEffect, useState } from 'react';
import type { Identities } from './identity-schema';
import { identitiesSchema } from './identity-schema';

const cache: {
  [url: string]: Identities;
} = {};

export const useOracleProofs = (url?: string) => {
  const [data, setData] = useState<Identities | undefined>(() =>
    url ? cache[url] : undefined
  );
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [error, setError] = useState<Error>();

  useEffect(() => {
    let ignore = false;

    if (!url) return;

    const run = async () => {
      try {
        setStatus('loading');
        if (cache[url]) {
          setData(cache[url]);
          setStatus('done');
        } else {
          console.log('fetch');
          // const res = await fetch(url);
          // const json = await res.json();
          // TODO remove fakeFetch
          const json = await fakeFetch();

          if (ignore) return;

          const validJson = identitiesSchema.parse(json);

          cache[url] = validJson;
          setData(validJson);
          setStatus('done');
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error('Something went wrong'));
        }
      } finally {
        setStatus('done');
      }
    };

    run();

    return () => {
      ignore = true;
    };
  }, [url]);

  return {
    data,
    loading: status === 'loading',
    error,
  };
};

const identitiesdata: Identities = [
  {
    type: 'PubKey',
    key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
    status: 'GOOD',
    trusted: true,
    url: 'https://github.com/vegaprotcol/well-known',
    proofs: [
      {
        type: 'Url',
        url: 'https://github.com',
      },
      {
        type: 'SignedMessage',
        message: 'somemessage',
      },
    ],
  },
  {
    type: 'ETHAddress',
    address: '0x949AF81E51D57831AE52591d17fBcdd1014a5f52',
    status: 'GOOD',
    trusted: true,
    url: 'https://github.com/vegaprotcol/well-known',
    proofs: [
      {
        type: 'Url',
        url: 'https://github.com',
      },
      {
        type: 'SignedMessage',
        message: 'somemessage',
      },
    ],
  },
  {
    type: 'PubKey',
    key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
    status: 'MALICIOUS',
    trusted: false,
    url: 'https://github.com/vegaprotcol/well-known',
    proofs: [
      {
        type: 'Url',
        url: 'https://github.com',
      },
      {
        type: 'SignedMessage',
        message: 'somemessage',
      },
    ],
  },
];

const fakeFetch = async (): Promise<Identities> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(identitiesdata), 500);
  });
};
