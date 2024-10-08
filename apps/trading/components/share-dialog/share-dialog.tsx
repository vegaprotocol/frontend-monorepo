import { create } from 'zustand';
import {
  AnchorButton,
  Button,
  CopyWithTooltip,
  Dialog,
  Input,
  Intent,
  TradingCheckbox,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import {
  useSimpleTransaction,
  useVegaWallet,
} from '@vegaprotocol/wallet-react';
import { useFindReferralSet } from '../../client-pages/referrals/hooks/use-find-referral-set';
import { Links } from '../../lib/links';
import { useMyTeam } from '../../lib/hooks/use-my-team';
import { type ReactNode, useState } from 'react';
import { TransactionSteps } from '../transaction-dialog/transaction-steps';

type ShareDialogStore = {
  isOpen: boolean;
  withTeam: boolean;
  setOpen: (isOpen: boolean) => void;
  setWithTeam: (withTeam: boolean) => void;
};

export const useShareDialogStore = create<ShareDialogStore>()((set) => ({
  isOpen: false,
  withTeam: false,
  setOpen: (isOpen) => {
    set({ isOpen });
  },
  setWithTeam: (withTeam) => {
    set({ withTeam });
  },
}));

const TWITTER_TWEET_LINK =
  'https://twitter.com/intent/tweet?text={{TEXT}}&url={{URL}}';

enum InnerView {
  CreateCode = 'CreateCode',
  Default = 'Default',
}

export const ShareDialog = () => {
  const t = useT();
  const location = globalThis.location;

  const [innerView, setInnerView] = useState<InnerView>(InnerView.Default);

  const [isOpen, setOpen] = useShareDialogStore((state) => [
    state.isOpen,
    state.setOpen,
  ]);
  const [withTeam, setWithTeam] = useShareDialogStore((state) => [
    state.withTeam,
    state.setWithTeam,
  ]);

  const { pubKey } = useVegaWallet();

  const {
    data: referralSet,
    loading: referralLoading,
    role: referralRole,
    refetch,
  } = useFindReferralSet(pubKey);

  const { team, loading: teamLoading } = useMyTeam();

  const { error, reset, result, send, status } = useSimpleTransaction({
    onSuccess: () => {
      refetch();
    },
  });

  const createReferralCode = () => {
    setInnerView(InnerView.CreateCode);
    send({
      createReferralSet: {
        isTeam: false,
      },
    });
  };
  const dismiss = () => {
    setInnerView(InnerView.Default);
    reset();
  };

  let referralCode: string | undefined = undefined;

  const shareLink = new URL(location.origin);
  shareLink.hash = Links.INVITE();

  if (!referralLoading && referralSet && referralRole === 'referrer') {
    referralCode = referralSet.id;
    shareLink.hash = Links.INVITE_REFERRAL_CODE(referralCode);
  }

  if (!teamLoading && team && withTeam) {
    shareLink.hash = Links.INVITE_TEAM_CODE(team.teamId);
    if (referralCode) {
      shareLink.hash = Links.INVITE_REFERRAL_CODE_AND_TEAM(
        referralCode,
        team.teamId
      );
    }
  }

  let view: ReactNode = undefined;
  switch (innerView) {
    case InnerView.CreateCode:
      view = (
        <TransactionSteps
          reset={dismiss}
          resetLabel={t('Back')}
          status={status}
          error={error}
          result={result}
        />
      );
      break;
    case InnerView.Default:
      view = (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            {pubKey ? (
              referralCode ? (
                <label className="flex flex-col gap-1">
                  <span className="text-sm">
                    {t('SHARE_DIALOG_REFERRAL_CODE_LABEL')}
                  </span>
                  <Input
                    value={referralCode}
                    readOnly={true}
                    appendElement={
                      <CopyWithTooltip text={referralCode || ''}>
                        <button>
                          <VegaIcon name={VegaIconNames.COPY} />
                        </button>
                      </CopyWithTooltip>
                    }
                  />
                </label>
              ) : (
                <Button
                  onClick={() => {
                    createReferralCode();
                  }}
                >
                  {t('SHARE_DIALOG_CREATE_REFERRAL_CODE')}
                </Button>
              )
            ) : null}
            <label className="flex flex-col gap-1">
              <span className="text-sm">
                {t('SHARE_DIALOG_SHARE_LINK_LABEL')}
              </span>
              <Input
                value={shareLink.toString()}
                readOnly={true}
                appendElement={
                  <CopyWithTooltip text={shareLink.toString()}>
                    <button>
                      <VegaIcon name={VegaIconNames.COPY} />
                    </button>
                  </CopyWithTooltip>
                }
              />
            </label>
            {pubKey && team && (
              <label className="flex gap-1">
                <TradingCheckbox
                  checked={withTeam}
                  onCheckedChange={(checked) =>
                    setWithTeam(checked !== 'indeterminate' ? checked : false)
                  }
                />
                <span className="text-sm">
                  {t('SHARE_DIALOG_WITH_TEAM_LABEL')}
                </span>
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <CopyWithTooltip text={shareLink.toString()}>
              <Button intent={Intent.Primary} className="w-full">
                {t('SHARE_DIALOG_COPY_LINK_BUTTON')}
              </Button>
            </CopyWithTooltip>

            <AnchorButton
              href={TWITTER_TWEET_LINK.replace(
                '{{TEXT}}',
                encodeURIComponent(t('SHARE_DIALOG_SHARE_TEXT'))
              ).replace('{{URL}}', encodeURIComponent(shareLink.toString()))}
              target="_blank"
              rel="noreferrer"
              className="w-full"
            >
              {t('SHARE_DIALOG_SHARE_TO_BUTTON')}
            </AnchorButton>
          </div>
        </div>
      );
      break;
  }

  return (
    <Dialog
      open={isOpen}
      onChange={(isOpen) => {
        setOpen(isOpen);
        setInnerView(InnerView.Default);
      }}
      title={t('SHARE_DIALOG_TITLE')}
      description={t('SHARE_DIALOG_DESCRIPTION')}
      size="medium"
    >
      {view}
    </Dialog>
  );
};
