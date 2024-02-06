import { Link } from 'react-router-dom';
import { Button } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import Routes from '../../../routes';

export const ProposalsListItemDetails = ({ id }: { id: string }) => {
  const { t } = useTranslation();

  return (
    <div className="mt-4 items-start text-sm">
      <Link to={`${Routes.PROPOSALS}/${id}`}>
        <Button data-testid="view-proposal-btn">{t('viewDetails')}</Button>
      </Link>
    </div>
  );
};
