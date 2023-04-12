export const calculateEpochOffset = ({
  epochId,
  page,
  size,
}: { epochId: number, page: number, size: number }) => {
  // offset the epoch by the current page number times the page size while making sure it doesn't go below the minimum epoch value
  return {
    fromEpoch: Math.max(0, epochId - size * page) + 1,
    toEpoch: epochId - size * page + size,
  }
}