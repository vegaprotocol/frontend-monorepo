import type { ButtonProps } from '@vegaprotocol/ui-toolkit';
import { Button, Loader } from '@vegaprotocol/ui-toolkit';

export interface LoadingButtonProperties extends ButtonProps {
  text: string;
  loadingText: string;
  loading: boolean;
}

export const LoadingButton = ({
  text,
  loading,
  loadingText,
  disabled,
  ...rest
}: LoadingButtonProperties) => {
  return (
    <Button {...rest} disabled={disabled || loading}>
      <div className="flex items-center justify-center">
        {loading ? `${loadingText}…` : text}
        {loading && (
          <span className="ml-2">
            <Loader size="small" />
          </span>
        )}
      </div>
    </Button>
  );
};
