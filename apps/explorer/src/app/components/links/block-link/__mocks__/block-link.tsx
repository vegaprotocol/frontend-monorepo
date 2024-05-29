export const BlockLink = ({ height }: { height: string }) => (
  <a href={`/blocks/${height}`}>{height}</a>
);
