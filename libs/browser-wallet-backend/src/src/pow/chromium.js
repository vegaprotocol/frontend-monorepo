import JSONRPCClient from '../../../frontend/lib/json-rpc-client.js';

const runtime = globalThis.browser?.runtime ?? globalThis.chrome?.runtime;

// "Mutex" for creating offscreen documents
let offscreenDocumentPending = null;
export default async function initChrome() {
  if (globalThis?.chrome?.offscreen == null) return false;

  const OFFSCREEN_DOCUMENT_URL = runtime.getURL('chrome-pow.html');

  /* istanbul ignore next */
  const client = new JSONRPCClient({
    idPrefix: 'chrome-pow-',
    async send(req) {
      // Not sure we need to do this here, however the life-cycle of offscreen documents seems to be
      // independent of the background life-cycle.
      // If it turns out we can rely on the document living for at least as long as the background process
      // we can move this call to the start of the closure
      await ensureOffscreenDocument();

      chrome.runtime.sendMessage({
        target: 'offscreen',
        data: req,
      });
    },
  });

  /* istanbul ignore next */
  runtime.onMessage.addListener(function listener(message, sender) {
    // ensure sender.id is the same as this extension id
    if (sender.id !== chrome.runtime.id) return;

    // ensure message is from the offscreen document
    if (sender.url !== OFFSCREEN_DOCUMENT_URL) return;

    if (message.target !== 'offscreen') return;

    client.onmessage(message.data);
  });

  return async function (args) {
    const sol = await client.request('solve', args);

    sol.nonce = BigInt(sol.nonce);

    return sol;
  };

  /* istanbul ignore next */
  async function ensureOffscreenDocument() {
    // Is the page still alive?
    if (await hasDocument()) return;

    // Are we concurrently trying to create the page?
    if (offscreenDocumentPending != null) return await offscreenDocumentPending;

    offscreenDocumentPending = globalThis.chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_URL,
      reasons: ['WORKERS'],
      justification:
        'This will speed up Vega transaction creation by solving anti-spam PoW challenges in parallel',
    });

    await offscreenDocumentPending;
    // Cleanup after, so next call does not await a page that might be removed
    offscreenDocumentPending = null;
  }

  /* istanbul ignore next */
  async function hasDocument() {
    const allClients = await globalThis.clients.matchAll();
    return allClients.some((client) => client.url === OFFSCREEN_DOCUMENT_URL);
  }
}
