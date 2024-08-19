import { Trans, useTranslation } from 'react-i18next';

interface TargetAddressMismatchProps {
  connectedAddress: string;
  expectedAddress: string;
}

export const TargetAddressMismatch = ({
  connectedAddress,
  expectedAddress,
}: TargetAddressMismatchProps) => {
  const { t } = useTranslation();
  return (
    <>
      <p>
        {t('connectedAddress', {
          address: connectedAddress,
        })}
      </p>
      <p>
        <Trans
          i18nKey="addressMismatch"
          values={{
            target: expectedAddress,
          }}
          components={{
            bold: <strong />,
            red: <span className={'text-pink'} />,
          }}
        />
      </p>
    </>
  );
};
