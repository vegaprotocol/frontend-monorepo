import { removePaginationWrapper } from './remove-pagination';

describe('removePaginationWrapper', () => {
  it('should remove null and undefined nodes from the edges array', () => {
    const edges = [
      { node: 'A' },
      null,
      { node: 'B' },
      undefined,
      { node: 'C' },
    ];

    const result = removePaginationWrapper(edges);
    expect(result).toEqual(['A', 'B', 'C']);
  });

  it('should handle an empty edges array', () => {
    const edges: Array<{ node: string } | null> = [];

    const result = removePaginationWrapper(edges);
    expect(result).toEqual([]);
  });

  it('should handle undefined edges', () => {
    const edges: Array<{ node: string } | null> | undefined = undefined;

    const result = removePaginationWrapper(edges);
    expect(result).toEqual([]);
  });

  it('should handle null edges', () => {
    const edges: Array<{ node: string } | null> | null = null;

    const result = removePaginationWrapper(edges);
    expect(result).toEqual([]);
  });

  it('should handle all null nodes in the edges array', () => {
    const edges = [null, null, null];

    const result = removePaginationWrapper(edges);
    expect(result).toEqual([]);
  });

  it('should handle a mixture of nodes, nulls, and undefined in the edges array', () => {
    const edges = [
      { node: 'A' },
      null,
      undefined,
      { node: 'B' },
      null,
      { node: 'C' },
    ];

    const result = removePaginationWrapper(edges);
    expect(result).toEqual(['A', 'B', 'C']);
  });
});
