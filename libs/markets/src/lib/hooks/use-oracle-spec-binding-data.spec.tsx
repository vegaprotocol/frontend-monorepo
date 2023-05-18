import { renderHook, waitFor } from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { ReactNode } from 'react';
import { useOracleSpecBindingData } from './use-oracle-spec-binding-data';
import type { Property } from '@vegaprotocol/types';
import type { OracleSpecDataConnectionQuery } from '../__generated__/OracleSpecDataConnection';
import { OracleSpecDataConnectionDocument } from '../__generated__/OracleSpecDataConnection';

describe('useSettlementPrice', () => {
  const setup = (
    oracleSpecId: string,
    specBinding: string,
    mocks: MockedResponse<OracleSpecDataConnectionQuery>[]
  ) => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={mocks}>{children}</MockedProvider>
    );
    return renderHook(
      () => useOracleSpecBindingData(oracleSpecId, specBinding),
      {
        wrapper,
      }
    );
  };
  const createMock = (
    id: string,
    property: Property
  ): MockedResponse<OracleSpecDataConnectionQuery> => {
    return {
      request: {
        query: OracleSpecDataConnectionDocument,
        variables: {
          oracleSpecId: id,
        },
      },
      result: {
        data: {
          oracleSpec: {
            dataConnection: {
              edges: [
                {
                  node: {
                    externalData: {
                      data: {
                        data: [property],
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    };
  };

  it('should returns the matching value for the spec binding', async () => {
    const oracleSpecId = 'oracle-spec-id';
    const specBinding = 'spec-binding';
    const value = '123456';
    const property = {
      __typename: 'Property' as const,
      name: specBinding,
      value,
    };
    const mock = createMock(oracleSpecId, property);

    const { result } = setup(oracleSpecId, specBinding, [mock]);

    expect(result.current.property).toEqual(undefined);
    expect(result.current.data).toBe(undefined);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(undefined);

    await waitFor(() => {
      expect(result.current.property).toEqual(property);
      expect(result.current.loading).toBe(false);
    });
  });

  it('returns nothing if matching poperty not found', async () => {
    const oracleSpecId = 'oracle-spec-id';
    const specBinding = 'spec-binding';
    const value = '123456';
    const property = {
      __typename: 'Property' as const,
      name: 'does not match',
      value,
    };
    const mock = createMock(oracleSpecId, property);

    const { result } = setup(oracleSpecId, specBinding, [mock]);
    expect(result.current.property).toEqual(undefined);
    expect(result.current.data).toBe(undefined);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(undefined);

    await waitFor(() => {
      expect(result.current.property).toEqual(undefined);
      expect(result.current.loading).toBe(false);
    });
  });
});
