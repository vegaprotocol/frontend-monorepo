import { t } from '@vegaprotocol/i18n';
import { BlocksRefetch } from '../blocks';

import { Button } from '@vegaprotocol/ui-toolkit';

export interface TxListNavigationProps {
  refreshTxs: () => void;
  nextPage: () => void;
  previousPage: () => void;
  loading?: boolean;
  hasPreviousPage: boolean;
  hasMoreTxs: boolean;
  children?: React.ReactNode;
  isEmpty?: boolean;
}
/**
 * Displays a list of transactions with filters and controls to navigate through the list.
 *
 * @returns {JSX.Element} Transaction List and controls
 */
export const TxsListNavigation = ({
  refreshTxs,
  nextPage,
  previousPage,
  children,
  isEmpty,
  loading = false,
}: TxListNavigationProps) => {
  return (
    <>
      <menu className="mb-2 w-full ">{children}</menu>
      <menu className="mb-2 w-full">
        <BlocksRefetch refetch={refreshTxs} />
        <div className="float-right">
          <Button
            className="mr-2"
            size="xs"
            onClick={() => {
              previousPage();
            }}
          >
            {t('Newer')}
          </Button>
          <Button
            size="xs"
            disabled={isEmpty}
            onClick={() => {
              nextPage();
            }}
          >
            {t('Older')}
          </Button>
        </div>
        <div className="float-right mr-2">
          {loading ? (
            <span className="text-gs-300">{t('Loading...')}</span>
          ) : null}
        </div>
      </menu>
    </>
  );
};
