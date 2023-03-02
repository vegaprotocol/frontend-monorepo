import { render } from '@testing-library/react';
import { t } from '@vegaprotocol/i18n';

import type { components } from '../../../../../types/explorer';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { TxDetailsChainMultisigThreshold } from './tx-multisig-threshold';
import omit from 'lodash/omit';
import { getBlockTime } from './lib/get-block-time';

type Threshold =
  components['schemas']['vegaERC20MultiSigEvent']['thresholdSet'];

const mockBlockTime = '1669631323';
// Note: nonce is missing from this partial because the component does not render
// the nonce currently. It could render the nonce, at which point it can be added
// here.
const fullMock: Partial<Threshold> = {
  blockTime: mockBlockTime,
  newThreshold: 667,
};

describe('Chain Event: multisig threshold change', () => {
  it('Copes with a poorly formatted time prop', () => {
    const mockWithBadTime: Threshold = {
      blockTime: '-',
      newThreshold: 1000,
      nonce: 'nonce123',
    };
    const screen = render(
      <table>
        <tbody>
          <TxDetailsChainMultisigThreshold thresholdSet={mockWithBadTime} />
        </tbody>
      </table>
    );

    expect(screen.getByText(t('Threshold change date'))).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it(`Renders nothing if correct type with partial data is provided`, () => {
    for (const key in fullMock) {
      const mock = omit(fullMock, key);
      const screen = render(
        <TxDetailsChainMultisigThreshold thresholdSet={mock} />
      );
      expect(screen.container).toBeEmptyDOMElement();
    }
  });

  it('Renders TableRows if all data is provided', () => {
    const mock: Threshold = Object.assign({}, fullMock, {
      nonce: 'nonce123',
    });

    const screen = render(
      <MockedProvider>
        <MemoryRouter>
          <table>
            <tbody>
              <TxDetailsChainMultisigThreshold thresholdSet={mock} />
            </tbody>
          </table>
        </MemoryRouter>
      </MockedProvider>
    );

    expect(screen.getByText(t('Chain event type'))).toBeInTheDocument();
    expect(
      screen.getByText(t('ERC20 multisig threshold set'))
    ).toBeInTheDocument();

    expect(screen.getByText(t('Threshold'))).toBeInTheDocument();
    expect(screen.getByText(`66.7%`)).toBeInTheDocument();

    const expectedDate = getBlockTime(mockBlockTime);

    expect(screen.getByText(t('Threshold change date'))).toBeInTheDocument();
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });
});
