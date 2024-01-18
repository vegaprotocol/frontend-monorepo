import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import { RainbowButton } from '../../components/rainbow-button';
import { useState } from 'react';
import {
  CopyWithTooltip,
  Dialog,
  ExternalLink,
  InputError,
  Intent,
  Tooltip,
  TradingAnchorButton,
  TradingButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { DApp, TokenStaticLinks, useLinks } from '@vegaprotocol/environment';
import { ABOUT_REFERRAL_DOCS_LINK } from './constants';
import { useIsInReferralSet, useReferral } from './hooks/use-referral';
import { useT } from '../../lib/use-t';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Links, Routes } from '../../lib/links';
import { useReferralProgram } from './hooks/use-referral-program';
import { useCreateReferralSet } from '../../lib/hooks/use-create-referral-set';
import { Trans } from 'react-i18next';

export const CreateCodeContainer = () => {
  const t = useT();
  const { pubKey, isReadOnly } = useVegaWallet();
  const isInReferralSet = useIsInReferralSet(pubKey);
  const openWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );

  // Navigate to the index page when already in the referral set.
  if (isInReferralSet) {
    return <Navigate to={Routes.REFERRALS} />;
  }

  return (
    <div
      data-testid="referral-create-code-form"
      className="md:w-2/3 max-w-md mx-auto bg-vega-clight-800 dark:bg-vega-cdark-800 p-8 rounded-lg"
    >
      <h3 className="mb-4 text-2xl text-center calt">
        {t('Create a referral code')}
      </h3>
      <p className="mb-4 text-center text-base">
        {t(
          'Generate a referral code to share with your friends and access the commission benefits of the current program.'
        )}
      </p>

      <div className="w-full flex flex-col gap-4 items-stretch">
        {pubKey ? (
          <CreateCodeForm />
        ) : (
          <RainbowButton
            variant="border"
            disabled={isReadOnly}
            onClick={openWalletDialog}
          >
            {t('Connect wallet')}
          </RainbowButton>
        )}
      </div>
    </div>
  );
};

export const CreateCodeForm = () => {
  const t = useT();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { isReadOnly } = useVegaWallet();

  return (
    <>
      <Tooltip
        description={t(
          'Create a simple referral code to enjoy the referrer commission outlined in the current referral program'
        )}
      >
        <span>
          <RainbowButton
            variant="border"
            disabled={isReadOnly}
            onClick={() => setDialogOpen(true)}
            className="w-full"
          >
            {t('Create a referral code')}
          </RainbowButton>
        </span>
      </Tooltip>
      <Tooltip
        description={
          <Trans
            i18nKey={
              'Make your referral code a Team to compete in Competitions with your friends, appear in leaderboards on the <0>Competitions Homepage</0>, and earn rewards'
            }
            components={[
              <Link
                key="homepage-link"
                to={Links.COMPETITIONS()}
                className="underline"
              >
                Compeitionts Homepage
              </Link>,
            ]}
          />
        }
      >
        <span>
          <RainbowButton
            role="link"
            variant="border"
            disabled={isReadOnly}
            onClick={() => navigate(Links.COMPETITIONS_CREATE_TEAM())}
            className="w-full"
          >
            {t('Create a team')}
          </RainbowButton>
        </span>
      </Tooltip>
      <p className="text-xs">
        <Link className="underline" to={Links.COMPETITIONS()}>
          {t('Go to competitions')}
        </Link>
      </p>
      <Dialog
        title={t('Create a referral code')}
        open={dialogOpen}
        onChange={() => setDialogOpen(false)}
        size="small"
      >
        <CreateCodeDialog setDialogOpen={setDialogOpen} />
      </Dialog>
    </>
  );
};

const CreateCodeDialog = ({
  setDialogOpen,
}: {
  setDialogOpen: (open: boolean) => void;
}) => {
  const t = useT();
  const createLink = useLinks(DApp.Governance);
  const { pubKey } = useVegaWallet();
  const { refetch } = useReferral({ pubKey, role: 'referrer' });
  const {
    err,
    code,
    status,
    stakeAvailable: currentStakeAvailable,
    requiredStake,
    onSubmit,
  } = useCreateReferralSet();

  const { details: programDetails } = useReferralProgram();

  const getButtonProps = () => {
    if (status === 'idle') {
      return {
        children: t('Generate code'),
        onClick: () => onSubmit({ createReferralSet: { isTeam: false } }),
      };
    }

    if (status === 'requested') {
      return {
        children: t('Confirm in wallet...'),
        disabled: true,
      };
    }

    if (status === 'pending') {
      return {
        children: t('Waiting for transaction...'),
        disabled: true,
      };
    }

    if (status === 'confirmed') {
      return {
        children: t('Close'),
        intent: Intent.Success,
        onClick: () => {
          refetch();
          setDialogOpen(false);
        },
      };
    }
  };

  if (!pubKey || currentStakeAvailable == null || requiredStake == null) {
    return (
      <div className="flex flex-col gap-4">
        <p>{t('You must be connected to the Vega wallet.')}</p>
        <TradingButton
          intent={Intent.Primary}
          onClick={() => setDialogOpen(false)}
        >
          {t('Close')}
        </TradingButton>
      </div>
    );
  }

  if (currentStakeAvailable < requiredStake) {
    return (
      <div className="flex flex-col gap-4">
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

  if (!programDetails) {
    return (
      <div className="flex flex-col gap-4">
        {(status === 'idle' ||
          status === 'requested' ||
          status === 'pending' ||
          err) && (
          <>
            {
              <p>
                {t(
                  'There is currently no referral program active, are you sure you want to create a code?'
                )}
              </p>
            }
          </>
        )}
        {status === 'confirmed' && code && (
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 p-2 text-sm rounded bg-vega-clight-700 dark:bg-vega-cdark-700">
              <p className="overflow-hidden whitespace-nowrap text-ellipsis">
                {code}
              </p>
            </div>
            <CopyWithTooltip text={code}>
              <TradingButton
                className="text-sm no-underline"
                icon={<VegaIcon name={VegaIconNames.COPY} />}
              >
                <span>{t('Copy')}</span>
              </TradingButton>
            </CopyWithTooltip>
          </div>
        )}
        <TradingButton
          fill={true}
          intent={Intent.Primary}
          onClick={() => onSubmit({ createReferralSet: { isTeam: false } })}
          {...getButtonProps()}
        >
          {t('Yes')}
        </TradingButton>
        {status === 'idle' && (
          <TradingButton
            fill={true}
            intent={Intent.Primary}
            onClick={() => {
              refetch();
              setDialogOpen(false);
            }}
          >
            {t('No')}
          </TradingButton>
        )}
        {err && <InputError>{err}</InputError>}
        <div className="flex justify-center pt-5 mt-2 text-sm border-t gap-4 text-default border-default">
          <ExternalLink href={ABOUT_REFERRAL_DOCS_LINK}>
            {t('About the referral program')}
          </ExternalLink>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {(status === 'idle' ||
        status === 'requested' ||
        status === 'pending' ||
        err) && (
        <p>
          {t(
            'Generate a referral code to share with your friends and access the commission benefits of the current program.'
          )}
        </p>
      )}
      {status === 'confirmed' && code && (
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 p-2 text-sm rounded bg-vega-clight-700 dark:bg-vega-cdark-700">
            <p className="overflow-hidden whitespace-nowrap text-ellipsis">
              {code}
            </p>
          </div>
          <CopyWithTooltip text={code}>
            <TradingButton
              className="text-sm no-underline"
              icon={<VegaIcon name={VegaIconNames.COPY} />}
            >
              <span>{t('Copy')}</span>
            </TradingButton>
          </CopyWithTooltip>
        </div>
      )}
      <TradingButton
        fill={true}
        intent={Intent.Primary}
        {...getButtonProps()}
      />
      {err && <InputError>{err}</InputError>}
      <div className="flex justify-center pt-5 mt-2 text-sm border-t gap-4 text-default border-default">
        <ExternalLink href={ABOUT_REFERRAL_DOCS_LINK}>
          {t('About the referral program')}
        </ExternalLink>
      </div>
    </div>
  );
};
