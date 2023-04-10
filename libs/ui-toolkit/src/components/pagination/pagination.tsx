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
  onFirst?: () => void;
  onLast?: () => void;
};

export const Pagination = ({
  className,
  hasPrevPage,
  hasNextPage,
  isLoading,
  children,
  onBack,
  onNext,
  onFirst,
  onLast,
}: PaginationProps) => {
  return (
    <div
      className={classnames(
        'flex gap-2 items-center justify-center',
        className
      )}
    >
      {onFirst && (
        <Button
          size="sm"
          disabled={isLoading || !hasPrevPage}
          className="rounded-full w-[34px] h-[34px]"
          onClick={onFirst}
        >
          <Icon name="double-chevron-left" ariaLabel="Back" />
        </Button>
      )}
      <Button
        size="sm"
        disabled={isLoading || !hasPrevPage}
        className="rounded-full w-[34px] h-[34px]"
        onClick={onBack}
      >
        <Icon name="chevron-left" ariaLabel="Back" />
      </Button>
      {children}
      <Button
        size="sm"
        disabled={isLoading || !hasNextPage}
        className="rounded-full w-[34px] h-[34px]"
        onClick={onNext}
      >
        <Icon name="chevron-right" ariaLabel="Next" />
      </Button>
      {onLast && (
        <Button
          size="sm"
          disabled={isLoading || !hasNextPage}
          className="rounded-full w-[34px] h-[34px]"
          onClick={onLast}
        >
          <Icon name="double-chevron-right" ariaLabel="Back" />
        </Button>
      )}
    </div>
  );
};
