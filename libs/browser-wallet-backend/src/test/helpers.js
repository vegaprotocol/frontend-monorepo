import http from 'node:http'

export async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function createHTTPServer(fn) {
  const server = http.createServer(fn)

  await new Promise(res => server.listen(res))

  return {
    url: new URL(`http://localhost:${server.address().port}/`),
    close: () => new Promise(res => server.close(res))
  }
}

export async function createJSONHTTPServer(fn) {
  return createHTTPServer(async (req, res) => {
    const data = await fn(req, res)

    res.writeHead(data.statusCode ?? 200, {
      'Content-Type': 'application/json'
    })
    res.end(JSON.stringify(data.body ?? {}))
  })
}
