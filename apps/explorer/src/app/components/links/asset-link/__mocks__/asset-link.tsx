export const AssetLink = ({ assetId }: { assetId: string }) => (
  <a href={`/assets/${assetId}`}>{assetId}</a>
);
