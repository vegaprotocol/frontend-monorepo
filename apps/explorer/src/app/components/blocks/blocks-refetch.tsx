import { t } from '@vegaprotocol/i18n';
import { Icon } from '@vegaprotocol/ui-toolkit';

// These are cribbed from dropdown-menu.tsx, so that the classes match
// the filter button this sits next to on the TXs list page
const defaultClasses = [
  'text-sm py-1 px-2 rounded bg-transparent border whitespace-nowrap',
  'border-vega-light-200 dark:border-vega-dark-200',
  'hover:border-vega-light-300 dark:hover:border-vega-dark-300',
].join(' ');

interface BlocksRefetchProps {
  refetch: () => void;
}

export const BlocksRefetch = ({ refetch }: BlocksRefetchProps) => {
  const refresh = () => {
    refetch();
  };

  return (
    <div className="inline mr-2">
      <button
        onClick={refresh}
        data-testid="refresh"
        className={defaultClasses}
      >
        <Icon name="refresh" className="mr-2" />
        {t('Load new')}
      </button>
    </div>
  );
};
