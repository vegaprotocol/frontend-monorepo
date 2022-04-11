import '@vegaprotocol/cypress';
import type { CyHttpMessages } from 'cypress/types/net-stubbing';

// Utility to match GraphQL mutation based on the operation name
export const hasOperationName = (
  req: CyHttpMessages.IncomingHttpRequest,
  operationName: string
) => {
  const { body } = req;
  return 'operationName' in body && body.operationName === operationName;
};
