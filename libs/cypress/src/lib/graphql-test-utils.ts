import type { CyHttpMessages } from 'cypress/types/net-stubbing';

export const hasOperationName = (
  req: CyHttpMessages.IncomingHttpRequest,
  operationName: string
) => {
  const { body } = req;
  return 'operationName' in body && body.operationName === operationName;
};

// Alias query if operationName matches
export const aliasQuery = (
  req: CyHttpMessages.IncomingHttpRequest,
  operationName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
) => {
  if (hasOperationName(req, operationName)) {
    req.alias = operationName;
    if (data !== undefined) {
      req.reply({
        statusCode: 200,
        body: { data },
      });
    }
  }
};

const hasMethod = (req: CyHttpMessages.IncomingHttpRequest, method: string) => {
  const { body } = req;
  return 'method' in body && body.method === method;
};

// Alias wallet query if method matches
export const aliasWalletQuery = (
  req: CyHttpMessages.IncomingHttpRequest,
  method: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
) => {
  const body = {
    jsonrpc: '2.0',
    id: '0',
    result: data,
  };
  if (hasMethod(req, method)) {
    req.alias = method;
    if (data !== undefined) {
      req.reply({
        statusCode: 200,
        body: body,
      });
    }
  }
};
