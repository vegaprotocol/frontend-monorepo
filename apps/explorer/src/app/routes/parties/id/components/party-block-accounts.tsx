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

export const PartyBlockAccounts = ({
  partyId,
  accountData,
  accountLoading,
  accountError,
}: PartyBlockAccountProps) => {
  const navigate = useNavigate();

  return (
    <PartyBlock
      title={t('Assets')}
      action={
        <Button
          size="sm"
          onClick={(e) => navigate(`/${Routes.PARTIES}/${partyId}/accounts`)}
        >
          {t('Show all')}
        </Button>
      }
    >
      {accountData ? (
        <p>
          {accountData.length} {t('assets, including')}{' '}
          {accountData
            .map((a) => a.asset.symbol)
            .slice(0, 3)
            .join(', ')}
        </p>
      ) : accountLoading && !accountError ? (
        <Loader size="small" />
      ) : (
        <p>
          <Icon className="mr-1" name="error" />
          <span className="text-sm">{t('Could not load assets')}</span>
        </p>
      )}
    </PartyBlock>
  );
};
