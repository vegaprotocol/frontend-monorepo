import { TradingButton as Button } from '@vegaprotocol/ui-toolkit';
import { useT } from './use-t';

export const Pagination = ({
  count,
  pageInfo,
  onLoad,
  hasDisplayedRows,
  showRetentionMessage,
}: {
  count: number;
  pageInfo: { hasNextPage?: boolean } | null;
  onLoad: () => void;
  hasDisplayedRows: boolean;
  showRetentionMessage: boolean;
}) => {
  const t = useT();
  let rowMessage = '';

  if (count && !pageInfo?.hasNextPage) {
    rowMessage = t('paginationAllLoaded', 'all {{count}} rows loaded', {
      count,
    });
  } else {
    rowMessage = t('paginationLoaded', '{{count}} rows loaded', { count });
  }

  return (
    <div className="border-default flex items-center justify-between border-t p-1">
      <div className="text-xs">
        {false}
        {showRetentionMessage &&
          t(
            'Depending on data node retention you may not be able see the full history'
          )}
      </div>
      <div className="flex items-center text-xs">
        <span>{rowMessage}</span>
        {pageInfo?.hasNextPage ? (
          <Button size="extra-small" className="ml-1" onClick={onLoad}>
            {t('Load more')}
          </Button>
        ) : null}
      </div>
      {count && hasDisplayedRows === false ? (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-xs">
          {t('No rows matching selected filters')}
        </div>
      ) : null}
    </div>
  );
};
