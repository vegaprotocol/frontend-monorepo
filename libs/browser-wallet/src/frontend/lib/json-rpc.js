/**
 * Validate whether a message is a JSON-RPC notification (ie no id)
 * @param {object} message
 * @returns {boolean}
 */
export function isNotification(message) {
  return (
    message?.jsonrpc === '2.0' && 'method' in message && message?.id == null
  )
}

/**
 * Validate whether a message is a JSON-RPC request (ie has id)
 * @param {object} message
 * @returns {boolean}
 */
export function isRequest(message) {
  return (
    message?.jsonrpc === '2.0' &&
    typeof message?.method === 'string' &&
    message?.id != null
  )
}

/**
 * Validate whether a message is a JSON-RPC response (ie has id and result or error)
 * @param {object} message
 * @returns {boolean}
 */
export function isResponse(message) {
  return (
    message?.jsonrpc === '2.0' &&
    message?.id != null &&
    ('result' in message || 'error' in message)
  )
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
  constructor(message, code, data) {
    super(message)
    this.code = code
    this.data = data
  }

  toJSON() {
    return { message: this.message, code: this.code, data: this.data }
  }
}
