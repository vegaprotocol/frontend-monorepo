import type { ReactNode } from 'react';
import classnames from 'classnames';
import { Button } from '../button';
import { Icon } from '../icon';

export type PaginationProps = {
  className?: string;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  isLoading?: boolean;
  children?: ReactNode;
  onBack: () => void;
  onNext: () => void;
};

export const Pagination = ({
  className,
  hasPrevPage,
  hasNextPage,
  isLoading,
  children,
  onBack,
  onNext,
}: PaginationProps) => {
  return (
    <div
      className={classnames(
        'flex gap-2 items-center justify-center',
        className
      )}
    >
      <Button
        size="sm"
        disabled={isLoading || !hasPrevPage}
        className="rounded-full w-[34px] h-[34px]"
        onClick={onBack}
      >
        <Icon name="arrow-left" ariaLabel="Back" />
      </Button>
      {children}
      <Button
        size="sm"
        disabled={isLoading || !hasNextPage}
        className="rounded-full w-[34px] h-[34px]"
        onClick={onNext}
      >
        <Icon name="arrow-right" ariaLabel="Next" />
      </Button>
    </div>
  );
};
