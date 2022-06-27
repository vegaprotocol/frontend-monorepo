import { aliasQuery } from '@vegaprotocol/cypress';
import { generateFills } from '@vegaprotocol/fills';
import type { CyHttpMessages } from 'cypress/types/net-stubbing';

export const mockPortfolioPage = (req: CyHttpMessages.IncomingHttpRequest) => {
  aliasQuery(req, 'Fills', generateFills());
};
