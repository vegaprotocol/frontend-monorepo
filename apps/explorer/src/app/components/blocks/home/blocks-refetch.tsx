interface BlocksRefetchProps {
  refetch: () => void;
}

export const BlocksRefetch = ({ refetch }: BlocksRefetchProps) => {
  return (
    <button
      onClick={() => refetch()}
      className="underline mb-28"
      data-testid="refresh"
    >
      Refresh to see latest blocks
    </button>
  );
};
