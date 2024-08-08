import JSONRPCClient from '../../../frontend/lib/json-rpc-client.js';
import mutex from 'mutexify/promise.js';

const runtime = globalThis.browser?.runtime ?? globalThis.chrome?.runtime;

const U64_MAX = 2n ** 64n - 1n;

// Increase to make buckets twice as big, which will make
// the amount of wasted work grow by a factor of NUM_WORKERS - 1, but
// also make the overhead smaller (messages, context switch out of WASM when solving)
const BUCKET_SIZE = 14n;

const PARTITION_DIVISOR = U64_MAX >> BUCKET_SIZE;

export default async function initWorkers() {
  if (
    globalThis?.Worker == null ||
    globalThis?.navigator?.hardwareConcurrency == null
  )
    return false;

  const WORKER_SCRIPT_URL = runtime.getURL('pow-worker.js');

  // Use all but two cores for solving
  const NUM_WORKERS = Math.max(navigator.hardwareConcurrency - 2, 1);

  /* istanbul ignore next */
  const workers = Array.from({ length: NUM_WORKERS }, (_) => {
    const worker = new Worker(WORKER_SCRIPT_URL);

    const client = new JSONRPCClient({
      send(req) {
        worker.postMessage(req);
      },
    });
    worker.onmessage = (ev) => {
      client.onmessage(ev.data);
    };

    return client;
  });

  // We create a lock queue so that we are not over-saturating with interleaved work
  const lock = mutex();

  /* istanbul ignore next */
  return async function (args) {
    const release = await lock();

    try {
      for (let i = 0; i < PARTITION_DIVISOR; i += NUM_WORKERS) {
        const res = await Promise.all(
          workers.map((w, j) => {
            const startNonce =
              (BigInt(i + j) * U64_MAX) / BigInt(PARTITION_DIVISOR);
            const endNonce =
              (BigInt(i + j + 1) * U64_MAX) / BigInt(PARTITION_DIVISOR);

            return w.request('solve', { ...args, startNonce, endNonce });
          })
        );

        const nonce = res.find((r) => r.nonce != null);

        if (nonce != null) return nonce;
      }
    } finally {
      release();
    }
  };
}
