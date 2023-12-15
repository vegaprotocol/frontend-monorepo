import { useT } from '../use-t';

export const useOracleStatuses = () => {
  const t = useT();
  return {
    UNKNOWN: t(
      "This public key's proofs have not been verified yet, or no proofs have been provided yet."
    ),
    GOOD: t("This public key's proofs have been verified."),
    SUSPICIOUS: t(
      'This public key is suspected to be acting in bad faith, pending investigation.'
    ),
    MALICIOUS: t('This public key has been observed acting in bad faith.'),
    RETIRED: t('This public key is no longer in use.'),
    COMPROMISED: t(
      'This public key is no longer in the control of its original owners.'
    ),
  };
};
