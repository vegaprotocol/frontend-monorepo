import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { SourceType } from './oracle';
import { OracleSigners } from './oracle-signers';
import { MockedProvider } from '@apollo/client/testing';

function renderComponent(sourceType: SourceType) {
  return (
    <MockedProvider>
      <MemoryRouter>
        <OracleSigners sourceType={sourceType} />
      </MemoryRouter>
    </MockedProvider>
  );
}

function renderComponentWrapped(sourceType: SourceType) {
  return (
    <table>
      <tbody>{renderComponent(sourceType)}</tbody>
    </table>
  );
}

describe('Oracle Signers component', () => {
  it('returns empty if there are no signers (null)', () => {
    const res = render(renderComponent({} as SourceType));
    expect(res.container).toBeEmptyDOMElement();
  });

  it('returns empty if there are no signers (empty)', () => {
    const mock: SourceType = {
      __typename: 'DataSourceDefinitionExternal',
      sourceType: {
        __typename: 'DataSourceSpecConfiguration',
        signers: [],
      },
    };
    const res = render(renderComponent(mock));
    expect(res.container).toBeEmptyDOMElement();
  });

  it('Correctly identifies an Ethereum based signer', () => {
    const mock: SourceType = {
      __typename: 'DataSourceDefinitionExternal',
      sourceType: {
        __typename: 'DataSourceSpecConfiguration',
        signers: [
          {
            __typename: 'Signer',
            signer: {
              __typename: 'ETHAddress',
              address: '0x123',
            },
          },
        ],
      },
    };
    const res = render(renderComponentWrapped(mock));
    expect(res.getByTestId('keytype')).toHaveTextContent('ETH');
  });

  it('Correctly identifies an Vega based signer', () => {
    const mock: SourceType = {
      __typename: 'DataSourceDefinitionExternal',
      sourceType: {
        __typename: 'DataSourceSpecConfiguration',
        signers: [
          {
            __typename: 'Signer',
            signer: {
              __typename: 'PubKey',
              key: '1234567891234567789123456789123456778912345678912345677891234567',
            },
          },
        ],
      },
    };
    const res = render(renderComponentWrapped(mock));
    expect(res.getByTestId('keytype')).toHaveTextContent('Vega');
  });
});
