import { TradingButton as Button } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';

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
  let rowMessage = '';

  if (count && !pageInfo?.hasNextPage) {
    rowMessage = t('all %s rows loaded', count.toString());
  } else {
    if (count === 1) {
      rowMessage = t('%s row loaded', count.toString());
    } else {
      rowMessage = t('%s rows loaded', count.toString());
    }
  }

  return (
    <div className="flex items-center justify-between p-1 border-t border-default">
      <div className="text-xs">
        {false}
        {showRetentionMessage &&
          t(
            'Depending on data node retention you may not be able see the "full" history'
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
        <div className="absolute text-xs top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {t('No rows matching selected filters')}
        </div>
      ) : null}
    </div>
  );
};
