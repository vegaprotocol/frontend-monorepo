import { useTranslation } from 'react-i18next';
import { Intent, Lozenge } from '@vegaprotocol/ui-toolkit';
import { Heading } from '../../../../components/heading';

export interface ProtocolUpgradeProposalDetailHeaderProps {
  releaseTag: string;
}

export const ProtocolUpgradeProposalDetailHeader = ({
  releaseTag,
}: ProtocolUpgradeProposalDetailHeaderProps) => {
  const { t } = useTranslation();
  return (
    <>
      <Heading title={t('vegaRelease{release}', { release: releaseTag })} />
      <div className="mb-10">
        <Lozenge intent={Intent.Success}>{t('networkUpgrade')}</Lozenge>
      </div>
    </>
  );
};
