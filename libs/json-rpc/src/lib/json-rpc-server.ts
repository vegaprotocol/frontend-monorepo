import {
  JSONRPCError,
  type JsonRpcMessage,
  isNotification,
  isRequest,
  isResponse,
} from './json-rpc';

const Errors = {
  JSONRPC_PARSE_ERROR: { code: -32700, message: 'Parse error' },
  JSONRPC_INVALID_REQUEST: { code: -32600, message: 'Invalid request' },
  JSONRPC_INTERNAL_ERROR: { code: -32603, message: 'Internal error' },
  JSONRPC_METHOD_NOT_FOUND: { code: -32601, message: 'Method not found' },
};

type NotificationHandler = (msg: JsonRpcMessage) => unknown;

type MessageHandler = (
  method: string,
  params: unknown,
  context: unknown
) => unknown;

export class JSONRPCServer {
  static Error = JSONRPCError;
  private _notificationListeners: Set<NotificationHandler>;
  private _dispatch: Map<
    string,
    (params: unknown, context: unknown) => unknown
  >;
  onnotification: MessageHandler;
  onerror: (ex: unknown, req: JsonRpcMessage, context: unknown) => unknown;

  constructor({
    methods,
    onnotification,
    onerror,
  }: {
    methods: Record<string, (params: unknown, context: unknown) => unknown>;
    onnotification?: MessageHandler;
    onerror?: (ex: unknown, req: JsonRpcMessage, context: unknown) => unknown;
  }) {
    const NOOP = () => {};
    this.onerror = onerror ?? NOOP;
    this.onnotification = onnotification ?? NOOP;
    this._dispatch = new Map(Object.entries(methods));

    this._notificationListeners = new Set();
  }

  notify(method: string, params: unknown) {
    const msg = {
      jsonrpc: '2.0',
      method,
      params,
    } as JsonRpcMessage;

    for (const listener of this._notificationListeners) {
      try {
        listener(msg);
      } catch (_) {
        // NOOP
      }
    }
  }

  listenNotifications(listener: NotificationHandler) {
    this._notificationListeners.add(listener);

    return () => this._notificationListeners.delete(listener);
  }

  async onrequest(req: JsonRpcMessage, context: unknown) {
    // Will match Arrays also but those will be caught below
    if (req == null || typeof req !== 'object') {
      return { jsonrpc: '2.0', error: Errors.JSONRPC_PARSE_ERROR };
    }

    if (isNotification(req)) {
      return this.onnotification(req.method, req.params, context);
    }

    // Ignore responses
    if (isResponse(req)) return;

    if (!isRequest(req)) {
      return {
        jsonrpc: '2.0',
        error: Errors.JSONRPC_INVALID_REQUEST,
        id: req.id,
      };
    }

    const method = this._dispatch.get(req.method);
    if (method == null) {
      return {
        jsonrpc: '2.0',
        error: Errors.JSONRPC_METHOD_NOT_FOUND,
        id: req.id,
      };
    }

    try {
      return {
        jsonrpc: '2.0',
        id: req.id,
        result: await method(req.params, context),
      };
    } catch (ex) {
      if (ex instanceof JSONRPCServer.Error) {
        return { jsonrpc: '2.0', error: ex.toJSON(), id: req.id };
      }

      this.onerror(ex, req, context);
      return {
        jsonrpc: '2.0',
        error: Errors.JSONRPC_INTERNAL_ERROR,
        id: req.id,
      };
    }
  }
}
