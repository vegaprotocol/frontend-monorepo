import { Button } from '@vegaprotocol/ui-toolkit';

interface BlocksRefetchProps {
  refetch: () => void;
}

export const BlocksRefetch = ({ refetch }: BlocksRefetchProps) => {
  return (
    <Button
      onClick={() => refetch()}
      variant="inline-link"
      className="mb-28"
      data-testid="refresh"
    >
      Refresh to see latest blocks
    </Button>
  );
};
