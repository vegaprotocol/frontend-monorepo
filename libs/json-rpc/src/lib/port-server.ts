import assert from 'nanoassert';
import { type JSONRPCServer } from './json-rpc-server';
import { type JsonRpcMessage } from './json-rpc';
import { type Port } from './port';

interface Context {
  port: Port;
  origin: string | undefined;
}

export class PortServer {
  onerror: (_: unknown) => void;
  onconnect: (ctx: Context) => Promise<void>;
  server: JSONRPCServer;
  ports: Map<Port, Context>;

  /**
   * PortServer handles JSONRPCServer requests from a MessagePort as a FIFO queue.
   * Multiple ports can be listened to at once, each getting their own queue.
   * Each queue is processed sequentially, only allowing a single in-flight message at a time.
   * Request handlers are passed the validated JSON RPC message and a context object containing the port and origin.
   * Additional metadata can be assigned to the context object. The context object is unique to each port and persistent.
   *
   * @constructor
   * @param {object} opts
   * @param {function} opts.onconnect - global connect handler
   * @param {function} opts.onerror - global error handler
   * @param {JSONRPCServer} opts.server - JSONRPCServer instance
   */
  constructor({
    onconnect,
    onerror,
    server,
  }: {
    onconnect: () => Promise<void>;
    onerror: (_: unknown) => void;
    server: JSONRPCServer;
  }) {
    const NOOP = () => {};
    this.onerror = onerror ?? NOOP;
    this.onconnect = onconnect ?? NOOP;
    this.server = server;

    this.server.listenNotifications((msg) => {
      this.ports.forEach((_, port) => port.postMessage(msg));
    });

    this.ports = new Map();
  }

  /**
   * Disconnect all ports matching the origin. If origin is '*', all ports are disconnected.
   * @param {string} origin
   * @returns {void}
   */
  disconnect(origin: string) {
    for (const [port, context] of this.ports.entries()) {
      if (origin === '*' || context.origin === origin) {
        port.disconnect();
      }
    }
  }

  /**
   * Broadcast a message to all ports matching the origin. If origin is '*', all ports are broadcasted to.
   * @param {string} origin
   * @param {object} message
   * @returns {void}
   */
  broadcast(origin: string, message: JsonRpcMessage) {
    for (const [port, context] of this.ports.entries()) {
      if (origin === '*' || context.origin === origin) {
        port.postMessage(message);
      }
    }
  }

  /**
   * Listen to a MessagePort
   * @param {Port} port
   * @returns {void}
   */
  listen(port: Port) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    const origin =
      port.sender &&
      (port.sender.url ? new URL(port.sender.url).origin : port.sender.id);
    const messageQueue: JsonRpcMessage[] = [];
    let busy = false;

    const context = { port, origin };

    this.ports.set(port, context);

    const onconnect = this.onconnect(context);

    port.onMessage.addListener(_onmessage);
    port.onDisconnect.addListener(_ondisconnect);

    async function _onmessage(message: JsonRpcMessage) {
      await onconnect;

      // Ensure the port is still connected
      if (self.ports.has(port) === false) return;

      // Append a message to the queue and
      // kick off the processing loop if idle
      messageQueue.push(message);

      if (busy === false) _process();
    }

    function _process() {
      const req = messageQueue.shift();
      if (req == null) return;
      busy = true;

      self.server
        .onrequest(req, context)
        .then((res) => {
          // notification
          if (res == null) return;

          // Client disconnected
          if (self.ports.has(port) === false) return;

          port.postMessage(res);
        })
        .catch(self.onerror)
        .finally(() => {
          busy = false;
          _process();
        });
    }

    function _ondisconnect(port: Port) {
      port.onMessage.removeListener(_onmessage);
      port.onDisconnect.removeListener(_ondisconnect);

      assert(self.ports.delete(port), 'Removed unknown port. Possible leak');
    }
  }
}
