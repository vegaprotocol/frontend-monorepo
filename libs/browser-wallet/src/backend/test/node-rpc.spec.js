import NodeRPC from '../src/node-rpc.js';
import { wait, createJSONHTTPServer } from './helpers.js';

async function createServer(height = 100, timeout = 0) {
  return createJSONHTTPServer(async () => {
    await wait(timeout);
    return { body: { height } };
  });
}

async function createFaultyServer() {
  return createJSONHTTPServer(async () => {
    return { statusCode: 500 };
  });
}

describe('findHealthyNode', () => {
  test('check one slow and three unhealthy nodes', async () => {
    const [slow, ...unhealthy] = await Promise.all([
      createServer(100, 100),
      createFaultyServer(),
      createFaultyServer(),
      createFaultyServer(),
    ]);

    const node = await NodeRPC.findHealthyNode([
      slow.url,
      ...unhealthy.map((s) => s.url),
    ]);

    expect(node._url).toBeInstanceOf(URL);
    expect(node._url.href).toBe(slow.url.href);

    await Promise.all([slow, ...unhealthy].map((s) => s.close()));
  });

  test('check one healthy and three unhealthy nodes', async () => {
    const [healthy, ...unhealthy] = await Promise.all([
      createServer(100),
      createFaultyServer(),
      createFaultyServer(),
      createFaultyServer(),
    ]);

    const node = await NodeRPC.findHealthyNode([
      healthy.url,
      ...unhealthy.map((s) => s.url),
    ]);

    expect(node._url).toBeInstanceOf(URL);
    expect(node._url.href).toBe(healthy.url.href);

    await Promise.all([healthy, ...unhealthy].map((s) => s.close()));
  });

  test('check one healthy and three slow nodes', async () => {
    const [healthy, ...slow] = await Promise.all([
      createServer(100),
      createServer(100, 100),
      createServer(100, 100),
      createServer(100, 100),
    ]);

    const node = await NodeRPC.findHealthyNode(
      [healthy.url, ...slow.map((s) => s.url)],
      undefined,
      undefined,
      5
    );

    expect(node._url).toBeInstanceOf(URL);
    expect(node._url.href).toBe(healthy.url.href);

    await Promise.all([healthy, ...slow].map((s) => s.close()));
  });

  test('check on healthy, one slow and one unhealthy node', async () => {
    const [healthy, slow, unhealthy] = await Promise.all([
      createServer(100),
      createServer(100, 100),
      createFaultyServer(),
    ]);

    const node = await NodeRPC.findHealthyNode(
      [healthy.url, slow.url, unhealthy.url],
      undefined,
      undefined,
      5
    );

    expect(node._url).toBeInstanceOf(URL);
    expect(node._url.href).toBe(healthy.url.href);

    await Promise.all([healthy, slow, unhealthy].map((s) => s.close()));
  });

  test('check a mix of healthy, slow and unhealthy nodes', async () => {
    const [healthy, slow, unhealthy] = await Promise.all([
      await Promise.all([
        createServer(100),
        createServer(99),
        createServer(101),
      ]),

      await Promise.all([
        createServer(100, 500),
        createServer(99, 500),
        createServer(101, 500),
      ]),

      await Promise.all([
        createServer(50),
        createServer(49),
        createServer(51),
        createFaultyServer(),
      ]),
    ]);

    const servers = [...healthy, ...slow, ...unhealthy];

    const node = await NodeRPC.findHealthyNode(
      servers.map((s) => s.url),
      undefined,
      undefined,
      5
    );

    expect(node._url).toBeInstanceOf(URL);
    expect(healthy.find((s) => s.url.href === node._url.href)).toBeDefined();

    await Promise.all(servers.map((s) => s.close()));
  });

  test('check error is thrown on only faulty nodes', async () => {
    const servers = await Promise.all([
      createFaultyServer(),
      createFaultyServer(),
    ]);

    await expect(
      NodeRPC.findHealthyNode(servers.map((s) => s.url))
    ).rejects.toThrow('No healthy node found');

    await Promise.all(servers.map((s) => s.close()));
  });

  test('Timeout error on JSON requests', async () => {
    const server = await createServer(100, 500);

    const rpc = new NodeRPC(server.url, 100);

    await expect(rpc.blockchainHeight()).rejects.toThrow(
      'The operation was aborted due to timeout'
    );

    await server.close();
  });
});
