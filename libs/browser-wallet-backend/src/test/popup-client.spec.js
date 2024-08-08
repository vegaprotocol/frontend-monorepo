import { PopupClient } from '../src/popup-client.js';

describe('PopupClient', () => {
  it('should be able to send messages to the background', async () => {
    const client = new PopupClient({});
    const port = {
      postMessage: jest.fn(),
      onMessage: {
        addListener: jest.fn(),
      },
      onDisconnect: {
        addListener: jest.fn(),
      },
    };

    await client.connect(port);
    expect(port.onMessage.addListener).toHaveBeenCalledTimes(1);
    expect(port.onDisconnect.addListener).toHaveBeenCalledTimes(1);
    expect(client.ports.size).toBe(1);
    expect(client.persistentQueue.length).toBe(0);
    expect(client.totalPending()).toBe(0);

    const prom = client.reviewConnection({});
    expect(port.postMessage).toHaveBeenCalledTimes(1);
    expect(port.postMessage).toHaveBeenCalledWith({
      jsonrpc: '2.0',
      method: 'popup.review_connection',
      params: {},
      id: expect.any(String),
    });
    expect(client.persistentQueue.length).toBe(1);
    expect(client.totalPending()).toBe(1);

    port.onMessage.addListener.mock.calls[0][0]({
      jsonrpc: '2.0',
      result: true,
      id: client.persistentQueue[0].id,
    });
    expect(await prom).toBe(true);
  });

  it('should queue messages until a port is connected', async () => {
    const client = new PopupClient({});

    client.reviewConnection({});
    expect(client.persistentQueue.length).toBe(1);
    expect(client.totalPending()).toBe(1);

    const port = {
      postMessage: jest.fn(),
      onMessage: {
        addListener: jest.fn(),
      },
      onDisconnect: {
        addListener: jest.fn(),
      },
    };

    await client.connect(port);
    expect(port.postMessage).toHaveBeenCalledTimes(1);
    expect(port.postMessage).toHaveBeenCalledWith({
      jsonrpc: '2.0',
      method: 'popup.review_connection',
      params: {},
      id: expect.any(String),
    });
  });

  it('should fan out to all connected ports', async () => {
    const client = new PopupClient({});

    client.reviewConnection({ origin: 'a' });

    const port1 = {
      postMessage: jest.fn(),
      onMessage: {
        addListener: jest.fn(),
      },
      onDisconnect: {
        addListener: jest.fn(),
      },
    };

    const port2 = {
      postMessage: jest.fn(),
      onMessage: {
        addListener: jest.fn(),
      },
      onDisconnect: {
        addListener: jest.fn(),
      },
    };

    await client.connect(port1);
    await client.connect(port2);

    expect(port1.postMessage).toHaveBeenCalledTimes(1);
    expect(port1.postMessage).toHaveBeenCalledWith({
      jsonrpc: '2.0',
      method: 'popup.review_connection',
      params: { origin: 'a' },
      id: expect.any(String),
    });

    expect(port2.postMessage).toHaveBeenCalledTimes(1);
    expect(port2.postMessage).toHaveBeenCalledWith({
      jsonrpc: '2.0',
      method: 'popup.review_connection',
      params: { origin: 'a' },
      id: expect.any(String),
    });

    port1.onMessage.addListener.mock.calls[0][0]({
      jsonrpc: '2.0',
      result: true,
      id: client.persistentQueue[0].id,
    });

    client.reviewConnection({ origin: 'b' });
    expect(port1.postMessage).toHaveBeenCalledTimes(2);
    expect(port1.postMessage).toHaveBeenCalledWith({
      jsonrpc: '2.0',
      method: 'popup.review_connection',
      params: { origin: 'b' },
      id: expect.any(String),
    });

    expect(port2.postMessage).toHaveBeenCalledTimes(2);
    expect(port2.postMessage).toHaveBeenCalledWith({
      jsonrpc: '2.0',
      method: 'popup.review_connection',
      params: { origin: 'b' },
      id: expect.any(String),
    });
  });
});
