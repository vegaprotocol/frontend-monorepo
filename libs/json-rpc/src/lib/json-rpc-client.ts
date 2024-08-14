import {
  JSONRPCError,
  type JsonRpcMessage,
  type JsonRpcResponse,
  isNotification,
  isResponse,
} from './json-rpc';

type NotificationHandler = (msg: JsonRpcResponse) => unknown;

export default class JSONRPCClient {
  static Error = JSONRPCError;
  private _send: (message: JsonRpcMessage) => void;
  private _onnotification: NotificationHandler;
  private inflight: Map<
    string,
    [(value: unknown) => void, (reason?: unknown) => void]
  >;
  private id: number;
  private _idPrefix: string;

  constructor({
    send,
    onnotification,
    idPrefix = Math.random().toString(36),
  }: {
    send?: (message: JsonRpcMessage) => void;
    onnotification?: NotificationHandler;
    idPrefix?: string;
  }) {
    const NOOP = () => {};
    this._send = send ?? NOOP;
    this._onnotification = onnotification ?? NOOP;
    this.inflight = new Map();
    this.id = 0;
    this._idPrefix = idPrefix;
  }

  notify(method: string, params: unknown) {
    const msg = {
      jsonrpc: '2.0',
      method,
      params,
    } as JsonRpcMessage;

    this._send(msg);
  }

  async request(method: string, params: unknown) {
    const id = this._idPrefix + ++this.id;
    const msg = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    } as JsonRpcMessage;

    return new Promise((resolve, reject) => {
      this.inflight.set(id, [resolve, reject]);

      this._send(msg);
    });
  }

  /**
   *
   * @param {any} data
   * @returns
   */
  async onmessage(data: JsonRpcResponse) {
    if (data == null) return; // invalid response

    if (isNotification(data)) return this._onnotification(data); // JSON-RPC notifications are not supported for now

    // Only react to responses and notifications
    if (!isResponse(data)) return;

    const id = data.id;
    const p = this.inflight.get(id);
    if (p == null) return; // duplicate or unknown response

    this.inflight.delete(id);

    if (data.error) {
      const err = new JSONRPCClient.Error(
        data.error.message,
        data.error.code,
        data.error.data
      );
      p[1](err);
      return;
    }

    p[0](data.result);
    return;
  }
}
