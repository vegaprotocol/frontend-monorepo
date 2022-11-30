import { removeNodeFromEdges } from './remove-node-from-edges';

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

    expect(removeNodeFromEdges(edges)).toEqual(expected);
  });

  it('should remove any null values', () => {
    const edges = [
      { node: { id: '1', name: 'foo' } },
      { node: null },
      { node: { id: '2', name: 'bar' } },
    ];

    expect(removeNodeFromEdges(edges)).toEqual(expected);
  });
});
