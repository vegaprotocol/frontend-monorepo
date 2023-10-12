import { Splash } from '@vegaprotocol/ui-toolkit';

export const AppFailure = ({
  title,
  error,
}: {
  title: string;
  error?: string | null;
}) => {
  return (
    <Splash>
      <p className="mb-4 text-xl">{title}</p>
      {error && <p className="mb-8 text-sm">{error}</p>}
    </Splash>
  );
};
