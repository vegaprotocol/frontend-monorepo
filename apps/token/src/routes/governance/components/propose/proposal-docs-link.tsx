import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from '@vegaprotocol/ui-toolkit';

interface ProposalDocsLinkProps {
  urlPart1: string;
  urlPart2?: string;
}

export const ProposalDocsLink = ({
  urlPart1,
  urlPart2,
}: ProposalDocsLinkProps) => {
  const { t } = useTranslation();
  const docsLink = `${urlPart1}${urlPart2 ? urlPart2 : '/tutorials/proposals'}`;
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
