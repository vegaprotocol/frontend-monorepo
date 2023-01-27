import { render } from '@testing-library/react';
import { t } from '@vegaprotocol/react-helpers';

import type { components } from '../../../../../types/explorer';
import omit from 'lodash/omit';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { TxDetailsChainEventStakeTotalSupply } from './tx-stake-totalsupply';

type TotalSupply = components['schemas']['vegaStakeTotalSupply'];

const fullMock: TotalSupply = {
  totalSupply: '123000000000000000000000',
  tokenAddress: 'eth123',
};

describe('Chain Event: Stake total supply change', () => {
  it('Renders nothing if no good data is provided', () => {
    const mock = undefined as unknown as TotalSupply;
    const screen = render(
      <TxDetailsChainEventStakeTotalSupply update={mock} />
    );

    expect(screen.container).toBeEmptyDOMElement();
  });

  it('Renders nothing if correct type with no data is provided', () => {
    const mock: TotalSupply = {};

    const screen = render(
      <TxDetailsChainEventStakeTotalSupply update={mock} />
    );
    expect(screen.container).toBeEmptyDOMElement();
  });

  it(`Renders nothing if correct type with partial data is provided`, () => {
    for (const key in fullMock) {
      const mock = omit(fullMock, key);
      const screen = render(
        <TxDetailsChainEventStakeTotalSupply update={mock} />
      );
      expect(screen.container).toBeEmptyDOMElement();
    }
  });

  it('Renders TableRows if all data is provided', () => {
    const screen = render(
      <MockedProvider>
        <MemoryRouter>
          <table>
            <tbody>
              <TxDetailsChainEventStakeTotalSupply update={fullMock} />
            </tbody>
          </table>
        </MemoryRouter>
      </MockedProvider>
    );

    expect(screen.getByText(t('Chain event type'))).toBeInTheDocument();
    expect(
      screen.getByText(t('Stake total supply update'))
    ).toBeInTheDocument();

    expect(screen.getByText(t('Total supply'))).toBeInTheDocument();
    expect(screen.getByText('123,000')).toBeInTheDocument();

    expect(screen.getByText(t('Source'))).toBeInTheDocument();
    const ethLink = screen.getByText(`${fullMock.tokenAddress}`);
    if (!ethLink.parentElement) {
      throw new Error('ETH link does not exist');
    }
    expect(ethLink.parentElement.getAttribute('href')).toContain(
      `/address/${fullMock.tokenAddress}`
    );
  });
});
