import { createJSONHTTPServer } from './helpers';
import { NetworkCollection } from '../src/network';

describe('NetworkCollection', () => {
  it('should set and get, returning a cached instance', async () => {
    const networks = new NetworkCollection(new Map());

    const net = await networks.set('testnet', {
      name: 'Testnet',
      rest: ['http://localhost:8080'],
      explorer: 'https://explorer.testnet.com',
    });

    const net2 = await networks.get('testnet');

    expect(net).toBe(net2);
  });

  it('should set and set should update internal cache', async () => {
    const networks = new NetworkCollection(new Map());

    const net = await networks.set('testnet', {
      name: 'Testnet',
      rest: ['http://localhost:8080'],
      explorer: 'https://explorer.testnet.com',
    });

    const net2 = await networks.set('testnet', {
      name: 'Testnet',
      rest: ['http://localhost:8080'],
      explorer: 'https://explorer.testnet.com',
    });

    expect(net).not.toBe(net2);
    expect(net2).toBe(await networks.get('testnet'));
  });

  it('should delete and delete should remove from internal cache', async () => {
    const networks = new NetworkCollection(new Map());

    await networks.set('testnet', {
      name: 'Testnet',
      rest: ['http://localhost:8080'],
      explorer: 'https://explorer.testnet.com',
    });

    await networks.delete('testnet');

    await expect(networks.get('testnet')).rejects.toThrow(
      'No network found for networkId testnet or chainId undefined'
    );
  });

  it('should find a healthy data node and cache result', async () => {
    const networks = new NetworkCollection(new Map());

    const dnHandler = jest.fn().mockResolvedValue({
      statusCode: 200,
      body: {
        height: '100',
      },
    });

    const datanode = await createJSONHTTPServer(dnHandler);

    const net = await networks.set('testnet', {
      name: 'Testnet',
      rest: [datanode.url.toString()],
      explorer: 'https://explorer.testnet.com',
    });

    const [a, b] = await Promise.all([net.rpc(), net.rpc()]);

    expect(dnHandler).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);

    await datanode.close();
  });

  it('should reject all pending rpc calls and not cache unhealthy datanode, until healthy', async () => {
    const networks = new NetworkCollection(new Map());

    const dnHandler = jest.fn().mockResolvedValue({
      statusCode: 400,
      body: {
        height: '100',
      },
    });

    const datanode = await createJSONHTTPServer(dnHandler);

    const net = await networks.set('testnet', {
      name: 'Testnet',
      rest: [datanode.url.toString()],
      explorer: 'https://explorer.testnet.com',
    });

    // Make a quick succession of concurrent calls
    await Promise.all([
      expect(net.rpc()).rejects.toThrowError('No healthy node found'),
      expect(net.rpc()).rejects.toThrowError('No healthy node found'),
      expect(net.rpc()).rejects.toThrowError('No healthy node found'),
    ]);

    expect(dnHandler).toHaveBeenCalledTimes(1);
    expect(net.probing).toBe(false);
    expect(net.preferredNode).toBe(null);

    dnHandler.mockResolvedValue({
      statusCode: 200,
      body: {
        height: '100',
      },
    });

    const [a, b] = await Promise.all([net.rpc(), net.rpc()]);

    expect(dnHandler).toHaveBeenCalledTimes(2);
    expect(a).toBe(b);

    await datanode.close();
  });

  it('should cache healthy datanode for some time', async () => {
    jest.useFakeTimers();

    const networks = new NetworkCollection(new Map());

    const dnHandler = jest.fn().mockResolvedValue({
      statusCode: 200,
      body: {
        height: '100',
      },
    });

    const datanode = await createJSONHTTPServer(dnHandler);

    const net = await networks.set('testnet', {
      name: 'Testnet',
      rest: [datanode.url.toString()],
      explorer: 'https://explorer.testnet.com',
    });

    const rpc1 = await net.rpc();
    const rpc2 = await net.rpc();

    jest.advanceTimersByTime(1000 * 3);

    const rpc3 = await net.rpc();

    expect(dnHandler).toHaveBeenCalledTimes(1);
    expect(rpc1).toBe(rpc2);
    expect(rpc1).toBe(rpc3);

    jest.advanceTimersByTime(1000 * 60 * 5);

    const rpc4 = await net.rpc();

    expect(dnHandler).toHaveBeenCalledTimes(2);
    expect(rpc1).not.toBe(rpc4);

    await datanode.close();
    jest.useRealTimers();
  });
});
