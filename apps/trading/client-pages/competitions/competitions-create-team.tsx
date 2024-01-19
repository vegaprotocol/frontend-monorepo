import { useSearchParams } from 'react-router-dom';
import { Intent, TradingAnchorButton } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useT } from '../../lib/use-t';
import { useReferralSetTransaction } from '../../lib/hooks/use-referral-set-transaction';
import { DApp, TokenStaticLinks, useLinks } from '@vegaprotocol/environment';
import { RainbowButton } from '../../components/rainbow-button';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { ErrorBoundary } from '../../components/error-boundary';
import { Box } from '../../components/competitions/box';
import { LayoutWithGradient } from '../../components/layouts-inner';
import { Links } from '../../lib/links';
import { TeamForm, TransactionType } from './team-form';

export interface FormFields {
  id: string;
  name: string;
  url: string;
  avatarUrl: string;
  private: boolean;
  allowList: string;
}

export const CompetitionsCreateTeam = () => {
  const [searchParams] = useSearchParams();
  const isSolo = Boolean(searchParams.get('solo'));
  const t = useT();
  usePageTitle(t('Create a team'));

  const { isReadOnly, pubKey } = useVegaWallet();
  const openWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );

  return (
    <ErrorBoundary feature="create-team">
      <LayoutWithGradient>
        <div className="mx-auto md:w-2/3 max-w-xl">
          <Box className="flex flex-col gap-4">
            <h1 className="calt text-2xl lg:text-3xl xl:text-4xl">
              {t('Create a team')}
            </h1>
            {pubKey && !isReadOnly ? (
              <CreateTeamFormContainer isSolo={isSolo} />
            ) : (
              <>
                <p>
                  {t(
                    'Create a team to participate in team based rewards as well as access the discount benefits of the current referral program.'
                  )}
                </p>
                <RainbowButton variant="border" onClick={openWalletDialog}>
                  {t('Connect wallet')}
                </RainbowButton>
              </>
            )}
          </Box>
        </div>
      </LayoutWithGradient>
    </ErrorBoundary>
  );
};

const CreateTeamFormContainer = ({ isSolo }: { isSolo: boolean }) => {
  const t = useT();
  const createLink = useLinks(DApp.Governance);

  const { err, status, code, isEligible, requiredStake, onSubmit } =
    useReferralSetTransaction({
      onSuccess: (code) => {
        // For some reason team creation takes a long time, too long even to make
        // polling viable, so its not feasible to navigate to the team page
        // after creation
        //
        // navigate(Links.COMPETITIONS_TEAM(code));
      },
    });

  if (status === 'confirmed') {
    return (
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm">{t('Team creation transaction successful')}</p>
        {code && (
          <>
            <p className="text-sm">
              Your team ID is:{' '}
              <span className="font-mono break-all">{code}</span>
            </p>
            <TradingAnchorButton
              href={Links.COMPETITIONS_TEAM(code)}
              intent={Intent.Info}
              size="small"
            >
              {t('View team')}
            </TradingAnchorButton>
          </>
        )}
      </div>
    );
  }

  if (!isEligible) {
    return (
      <div className="flex flex-col gap-4">
        {requiredStake !== undefined && (
          <p>
            {t(
              'You need at least {{requiredStake}} VEGA staked to generate a referral code and participate in the referral program.',
              {
                requiredStake: addDecimalsFormatNumber(
                  requiredStake.toString(),
                  18
                ),
              }
            )}
          </p>
        )}
        <TradingAnchorButton
          href={createLink(TokenStaticLinks.ASSOCIATE)}
          intent={Intent.Primary}
          target="_blank"
        >
          {t('Stake some $VEGA now')}
        </TradingAnchorButton>
      </div>
    );
  }

  return (
    <TeamForm
      type={TransactionType.CreateReferralSet}
      onSubmit={onSubmit}
      status={status}
      err={err}
      isSolo={isSolo}
    />
  );
};
