import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from '@vegaprotocol/ui-toolkit';

interface ProposalDocsLinkProps {
  url: string;
}

export const ProposalDocsLink = ({ url }: ProposalDocsLinkProps) => {
  const { t } = useTranslation();
  const docsLink = `${url}/tutorials/proposals`;
  const linkStyles = classnames('underline mb-2');

  return (
    <p>
      {t('ProposalDocsPrefix')}{' '}
      <Link href={docsLink} target="_blank" className={linkStyles}>
        {docsLink}
      </Link>
    </p>
  );
};
