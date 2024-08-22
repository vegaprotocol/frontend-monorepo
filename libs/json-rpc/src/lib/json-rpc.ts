export interface JsonRpcNotification<T = unknown> {
  method: string;
  params: T;
  jsonrpc: '2.0';
}

export interface JsonRpcMessage<T = unknown> {
  method: string;
  params: T;
  error?: JSONRPCError;
  jsonrpc: '2.0';
  id: string;
}

export interface JsonRpcResponse<T = unknown> {
  error?: JSONRPCError;
  result: T;
  jsonrpc: '2.0';
  id: string;
}

/**
 * Validate whether a message is a JSON-RPC notification (ie no id)
 * @param {object} message
 * @returns {boolean}
 */
export function isNotification(message: JsonRpcMessage | JsonRpcResponse) {
  return (
    message?.jsonrpc === '2.0' && 'method' in message && message?.id == null
  );
}

/**
 * Validate whether a message is a JSON-RPC request (ie has id)
 * @param {object} message
 * @returns {boolean}
 */
export function isRequest(message: JsonRpcMessage | JsonRpcResponse) {
  return (
    message?.jsonrpc === '2.0' &&
    'method' in message &&
    typeof message.method === 'string' &&
    message?.id != null
  );
}

/**
 * Validate whether a message is a JSON-RPC response (ie has id and result or error)
 * @param {object} message
 * @returns {boolean}
 */
export function isResponse(message: JsonRpcMessage | JsonRpcResponse) {
  return (
    message?.jsonrpc === '2.0' &&
    message?.id != null &&
    ('result' in message || 'error' in message)
  );
}

/**
 * JSON-RPC Error class that is serializable to JSON
 * @extends Error
 * @constructor
 * @param {string} message
 * @param {number} code
 * @param {any} data
 * @returns {JSONRPCError}
 */
export class JSONRPCError extends Error {
  code: number;
  data: Record<string, unknown>;

  constructor(message: string, code: number, data: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.data = data;
  }

  toJSON() {
    return { message: this.message, code: this.code, data: this.data };
  }
}
