import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useOnboardStore } from '../../stores/onboard';
import { useFindReferralSet } from '../referrals/hooks/use-find-referral-set';
import {
  Intent,
  Panel,
  ToastHeading,
  useToasts,
} from '@vegaprotocol/ui-toolkit';
import { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { ns, t } from '../../lib/use-t';

export const useCheckReferralSet = () => {
  const storedCode = useOnboardStore((state) => state.code);
  const [setToast, removeToast] = useToasts((state) => [
    state.setToast,
    state.remove,
  ]);
  const { pubKey } = useVegaWallet();
  const { data: referralSet } = useFindReferralSet(pubKey);

  const inRequestedReferralSet = referralSet && storedCode === referralSet.id;

  useEffect(() => {
    if (referralSet && !inRequestedReferralSet) {
      const toastId = 'invite-already-has-referral-set';
      setToast({
        id: toastId,
        intent: Intent.Danger,
        closeAfter: 30000,
        content: (
          <div>
            <ToastHeading>
              {t('ONBOARDING_STEP_APPLY_CODE_ALREADY_IN_IT_HEADER')}
            </ToastHeading>
            <Trans
              i18nKey={'ONBOARDING_STEP_APPLY_CODE_ALREADY_IN_IT_DESCRIPTION'}
              ns={ns}
              components={[
                <Panel key="code" className="truncate">
                  CODE
                </Panel>,
              ]}
              values={{ code: referralSet.id }}
            />
          </div>
        ),
        onClose: () => {
          removeToast(toastId);
        },
      });
    }
  }, [referralSet, inRequestedReferralSet, setToast, removeToast]);

  return null;
};
