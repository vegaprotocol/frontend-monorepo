import { useApplyGridTransaction } from './use-apply-grid-transaction';
import { renderHook } from '@testing-library/react-hooks';

type Items = Array<{ id: string; value: number }>;

const item = {
  id: '1',
  value: 1,
};
const item2 = {
  id: '2',
  value: 2,
};
const items = [item, item2];

function setup(items: Items, rowNodes: Items) {
  const gridApiMock = {
    applyTransaction: jest.fn(),
    getRowNode: (id: string) => {
      const node = rowNodes.find((i) => i.id === id);
      if (node) {
        return { data: node };
      }
      return undefined;
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderHook(() => useApplyGridTransaction(items, gridApiMock as any));
  return gridApiMock;
}

it('Adds items', () => {
  const gridApiMock = setup(items, []);
  expect(gridApiMock.applyTransaction).toHaveBeenCalledWith({
    update: [],
    add: items,
    addIndex: 0,
  });
});

it('Doesnt update rows without changes', () => {
  const rowNodes: Array<{ id: string; value: number }> = [...items];
  const gridApiMock = setup(items, rowNodes);
  expect(gridApiMock.applyTransaction).toHaveBeenCalledWith({
    update: [],
    add: [],
    addIndex: 0,
  });
});

it('Update rows with changes', () => {
  const rowNodes = [...items];
  const updatedItems = [
    { id: '1', value: 10 },
    { id: '2', value: 20 },
  ];
  const gridApiMock = setup(updatedItems, rowNodes);
  expect(gridApiMock.applyTransaction).toHaveBeenCalledWith({
    update: updatedItems,
    add: [],
    addIndex: 0,
  });
});

it('Updates and adds at the same time', () => {
  const newItem = { id: '3', value: 3 };
  const updatedItem = { id: '2', value: 20 };
  const gridApiMock = setup([newItem, updatedItem], [...items]);
  expect(gridApiMock.applyTransaction).toHaveBeenCalledWith({
    update: [updatedItem],
    add: [newItem],
    addIndex: 0,
  });
});
