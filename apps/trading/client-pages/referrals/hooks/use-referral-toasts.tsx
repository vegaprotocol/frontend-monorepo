import {
  Intent,
  type Toast,
  useToasts,
  ToastHeading,
  Button,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useEffect } from 'react';
import { useT } from '../../../lib/use-t';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { Routes } from '../../../lib/links';
import { useEpochInfoQuery } from '../../../lib/hooks/__generated__/Epoch';
import { useFindReferralSet } from './use-find-referral-set';

const REFETCH_INTERVAL = 60 * 60 * 1000; // 1h
const NON_ELIGIBLE_REFERRAL_SET_TOAST_ID = 'non-eligible-referral-set';

const useNonEligibleReferralSet = () => {
  const { pubKey } = useVegaWallet();
  const { data, loading, role, isEligible, refetch } =
    useFindReferralSet(pubKey);

  const {
    data: epochData,
    loading: epochLoading,
    refetch: epochRefetch,
  } = useEpochInfoQuery();

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      epochRefetch();
    }, REFETCH_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [epochRefetch, refetch]);

  return {
    data,
    isEligible,
    role,
    epoch: epochData?.epoch.id,
    loading: loading || epochLoading,
  };
};

export const useReferralToasts = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const t = useT();
  const [setToast, hasToast, updateToast] = useToasts((store) => [
    store.setToast,
    store.hasToast,
    store.update,
  ]);

  const { data, role, isEligible, epoch, loading } =
    useNonEligibleReferralSet();

  useEffect(() => {
    if (
      data &&
      role === 'referee' &&
      epoch &&
      !loading &&
      !isEligible &&
      !hasToast(NON_ELIGIBLE_REFERRAL_SET_TOAST_ID + epoch)
    ) {
      const nonEligibleReferralToast: Toast = {
        id: NON_ELIGIBLE_REFERRAL_SET_TOAST_ID + epoch,
        intent: Intent.Warning,
        content: (
          <>
            <ToastHeading>{t('Referral code no longer valid')}</ToastHeading>
            <p>
              {t(
                'Your referral code is no longer valid as the referrer no longer meets the minimum requirements.'
              )}
            </p>
            <p className="mt-2">
              <Button
                data-testid="toast-apply-code"
                size="xs"
                onClick={() => {
                  const matched = matchPath(Routes.REFERRALS, pathname);
                  if (!matched) navigate(Routes.REFERRALS_APPLY_CODE);
                  updateToast(NON_ELIGIBLE_REFERRAL_SET_TOAST_ID + epoch, {
                    hidden: true,
                  });
                }}
              >
                {t('Apply a new code')}
              </Button>
            </p>
          </>
        ),
        onClose: () =>
          updateToast(NON_ELIGIBLE_REFERRAL_SET_TOAST_ID + epoch, {
            hidden: true,
          }),
      };
      setToast(nonEligibleReferralToast);
    }
  }, [
    data,
    epoch,
    hasToast,
    isEligible,
    loading,
    navigate,
    pathname,
    role,
    setToast,
    t,
    updateToast,
  ]);
};
