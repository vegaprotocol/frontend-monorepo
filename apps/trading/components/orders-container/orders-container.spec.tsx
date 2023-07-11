import { act, renderHook } from '@testing-library/react';
import {
  FilterStatusValue,
  STORAGE_KEY,
  useOrderListGridState,
} from './orders-container';
import { Filter } from '@vegaprotocol/orders';
import { OrderType } from '@vegaprotocol/types';

describe('useOrderListGridState', () => {
  afterAll(() => {
    localStorage.clear();
  });

  const setup = (filter: Filter | undefined) => {
    return renderHook(() => useOrderListGridState(filter));
  };

  it.each(Object.values(Filter))(
    'providers correct AgGrid filter for %s',
    (filter) => {
      const { result } = setup(filter);
      expect(typeof result.current.updateGridState).toBe('function');
      expect(result.current.gridState).toEqual({
        columnState: undefined,
        filterModel: {
          status: {
            value: FilterStatusValue[filter],
          },
        },
      });
    }
  );

  it('provides correct AgGrid filter for all', () => {
    const { result } = setup(undefined);
    expect(typeof result.current.updateGridState).toBe('function');
    expect(result.current.gridState).toEqual({
      columnState: undefined,
      filterModel: undefined,
    });
  });

  it.each(Object.values(Filter))(
    'sets and stores column state and filters for %s',
    (filter) => {
      const filterModel = {
        type: {
          value: [OrderType.TYPE_LIMIT],
        },
      };
      const { result } = setup(filter);

      act(() => {
        result.current.updateGridState(filter, {
          filterModel,
        });
      });

      expect(result.current.gridState).toEqual({
        columnState: undefined,
        filterModel: {
          ...filterModel,
          status: {
            value: FilterStatusValue[filter],
          },
        },
      });

      const columnState = [{ colId: 'status', width: 200 }];

      act(() => {
        result.current.updateGridState(filter, {
          columnState,
        });
      });

      expect(result.current.gridState).toEqual({
        columnState,
        filterModel: {
          ...filterModel,
          status: {
            value: FilterStatusValue[filter],
          },
        },
      });

      const storeKeyMap = {
        [Filter.Open]: 'open',
        [Filter.Rejected]: 'rejected',
        [Filter.Closed]: 'closed',
      };

      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || '')).toMatchObject(
        {
          state: {
            [storeKeyMap[filter]]: {
              columnState,
              filterModel, // no need to check that status is set, hook will return status
            },
          },
        }
      );
    }
  );
});
