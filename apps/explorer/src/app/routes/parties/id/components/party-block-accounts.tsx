import { t } from '@vegaprotocol/i18n';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../../../routes/route-names';
import { Button, Icon, Loader } from '@vegaprotocol/ui-toolkit';
import { PartyBlock } from './party-block';
import type { AccountFields } from '@vegaprotocol/accounts';

export interface PartyBlockAccountProps {
  partyId: string;
  accountData: AccountFields[] | null;
  accountLoading: boolean;
  accountError?: Error;
}

/**
 * Displays an overview of a party's assets. This uses existing data
 * providers to structure the details by asset, rather than looking at
 * it by account. The assumption is that this is a more natural way to
 * get an idea of the assets and activity of a party.
 */
export const PartyBlockAccounts = ({
  partyId,
  accountData,
  accountLoading,
  accountError,
}: PartyBlockAccountProps) => {
  const navigate = useNavigate();

  const shouldShowActionButton =
    accountData && accountData.length > 0 && !accountLoading && !accountError;

  const action = shouldShowActionButton ? (
    <Button
      size="sm"
      onClick={() => navigate(`/${Routes.PARTIES}/${partyId}/assets`)}
    >
      {t('Show all')}
    </Button>
  ) : null;

  return (
    <PartyBlock title={t('Assets')} action={action}>
      {accountData && accountData.length > 0 ? (
        <p>
          {accountData.length} {t('assets, including')}{' '}
          {accountData
            .map((a) => a.asset.symbol)
            .slice(0, 3)
            .join(', ')}
        </p>
      ) : accountLoading && !accountError ? (
        <Loader size="small" />
      ) : accountData && accountData.length === 0 ? (
        <p>{t('No accounts found')}</p>
      ) : (
        <p>
          <Icon className="mr-1" name="error" />
          <span className="text-sm">{t('Could not load assets')}</span>
        </p>
      )}
    </PartyBlock>
  );
};
