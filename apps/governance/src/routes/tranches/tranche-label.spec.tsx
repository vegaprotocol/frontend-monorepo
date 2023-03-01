import { render } from '@testing-library/react';

import type { TrancheLabelProps } from './tranche-label';
import { TrancheLabel } from './tranche-label';

let props: TrancheLabelProps;

beforeEach(() => {
  props = {
    chainId: 1,
    id: 5,
  };
});

it('Renders null for right contract address, wrong network', () => {
  const WRONG_CHAIN = 3;
  const { container } = render(
    <TrancheLabel {...props} chainId={WRONG_CHAIN} />
  );

  expect(container).toBeEmptyDOMElement();
});

it('Renders null for right network, right contract address, tranche without a name', () => {
  const UNNAMED_TRANCHE = 0;

  const { container } = render(
    <TrancheLabel {...props} id={UNNAMED_TRANCHE} />
  );

  expect(container).toBeEmptyDOMElement();
});

it('Renders named for right network, right contract address, tranche with a name', () => {
  const { container } = render(<TrancheLabel {...props} />);
  expect(container).toHaveTextContent('Coinlist Option 1Community Whitelist');
});
