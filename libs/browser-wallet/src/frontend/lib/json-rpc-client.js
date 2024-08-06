import { JSONRPCError, isNotification, isResponse } from './json-rpc.js'

export default class JSONRPCClient {
  static Error = JSONRPCError

  constructor({
    send,
    onnotification = (_) => {},
    idPrefix = Math.random().toString(36)
  }) {
    this._send = send
    this._onnotification = onnotification ?? (() => {})
    this.inflight = new Map()
    this.id = 0
    this._idPrefix = idPrefix
  }

  notify(method, params) {
    const msg = {
      jsonrpc: '2.0',
      method,
      params
    }

    this._send(msg)
  }

  async request(method, params) {
    const id = this._idPrefix + ++this.id
    const msg = {
      jsonrpc: '2.0',
      id,
      method,
      params
    }

    return new Promise((resolve, reject) => {
      this.inflight.set(id, [resolve, reject])

      this._send(msg)
    })
  }

  /**
   *
   * @param {any} data
   * @returns
   */
  async onmessage(data) {
    if (data == null) return // invalid response

    if (isNotification(data)) return this._onnotification(data) // JSON-RPC notifications are not supported for now

    // Only react to responses and notifications
    if (!isResponse(data)) return

    const id = data.id
    const p = this.inflight.get(id)
    if (p == null) return // duplicate or unknown response

    this.inflight.delete(id)

    if (data.error) {
      const err = new JSONRPCClient.Error(
        data.error.message,
        data.error.code,
        data.error.data
      )
      p[1](err)
      return
    }

    p[0](data.result)
  }
}
