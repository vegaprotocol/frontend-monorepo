import { cn } from '../../utils/cn';
import { VegaIcon, VegaIconNames } from '../icon';

export interface LoaderProps {
  size?: 'small' | 'large';
  className?: string;
}

export const Loader = ({ size = 'large', className }: LoaderProps) => {
  const sizeNum = size === 'large' ? 32 : 20;

  return (
    <div
      className={cn('flex flex-col items-center text-gs-50', className)}
      data-testid="loader"
    >
      <VegaIcon
        name={VegaIconNames.LOADING}
        className="animate-spin"
        size={sizeNum}
      />
    </div>
  );
};
