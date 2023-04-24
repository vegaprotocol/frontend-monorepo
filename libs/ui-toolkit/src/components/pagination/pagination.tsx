import type { ReactNode } from 'react';
import { Button } from '../button';
import { Icon } from '../icon';

export type PaginationProps = {
  hasPrevPage: boolean;
  hasNextPage: boolean;
  isLoading?: boolean;
  children?: ReactNode;
  onBack: () => void;
  onNext: () => void;
  onFirst?: () => void;
  onLast?: () => void;
};

const buttonClass = 'rounded-full w-[34px] h-[34px]';

export const Pagination = ({
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
      className={'flex gap-2 my-2 items-center justify-center'}
      data-testid="page-info"
    >
      {onFirst && (
        <Button
          size="sm"
          data-testid="goto-first-page"
          disabled={isLoading || !hasPrevPage}
          className={buttonClass}
          onClick={onFirst}
        >
          <Icon name="double-chevron-left" ariaLabel="Back" />
        </Button>
      )}
      <Button
        size="sm"
        data-testid="goto-previous-page"
        disabled={isLoading || !hasPrevPage}
        className={buttonClass}
        onClick={onBack}
      >
        <Icon name="chevron-left" ariaLabel="Back" />
      </Button>
      {children}
      <Button
        size="sm"
        data-testid="goto-next-page"
        disabled={isLoading || !hasNextPage}
        className={buttonClass}
        onClick={onNext}
      >
        <Icon name="chevron-right" ariaLabel="Next" />
      </Button>
      {onLast && (
        <Button
          size="sm"
          data-testid="goto-last-page"
          disabled={isLoading || !hasNextPage}
          className={buttonClass}
          onClick={onLast}
        >
          <Icon name="double-chevron-right" ariaLabel="Back" />
        </Button>
      )}
    </div>
  );
};
