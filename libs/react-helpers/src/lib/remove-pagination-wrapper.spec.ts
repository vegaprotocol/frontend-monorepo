import { removePaginationWrapper } from './remove-pagination-wrapper';

const expected = [
  { id: '1', name: 'foo' },
  { id: '2', name: 'bar' },
];

describe('Remove node from edges', () => {
  it('should remove the node level structure', () => {
    const edges = [
      { node: { id: '1', name: 'foo' } },
      { node: { id: '2', name: 'bar' } },
    ];

    expect(removePaginationWrapper(edges)).toEqual(expected);
  });

  it('should remove any null values', () => {
    const edges = [
      { node: { id: '1', name: 'foo' } },
      { node: null },
      { node: { id: '2', name: 'bar' } },
      null,
    ];

    expect(removePaginationWrapper(edges)).toEqual(expected);
  });

  it('should return an empty array if no edges are provided', () => {
    expect(removePaginationWrapper(null)).toEqual([]);
    expect(removePaginationWrapper(undefined)).toEqual([]);
  });
});
