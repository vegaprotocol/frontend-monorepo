import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, RoundedWrapper } from '@vegaprotocol/ui-toolkit';
import { SubHeading } from '../../../../components/heading';
import { collapsibleToggleStyles } from '../../../../lib/collapsible-toggle-styles';

export const ProposalDescription = ({
  description,
}: {
  description: string;
}) => {
  const { t } = useTranslation();
  const [showDescription, setShowDescription] = useState(false);

  return (
    <section data-testid="proposal-description">
      <button
        onClick={() => setShowDescription(!showDescription)}
        data-testid="proposal-description-toggle"
      >
        <div className="flex items-center gap-3">
          <SubHeading title={t('proposalDescription')} />
          <div className={collapsibleToggleStyles(showDescription)}>
            <Icon name="chevron-down" size={8} />
          </div>
        </div>
      </button>

      {showDescription && (
        <RoundedWrapper paddingBottom={true} marginBottomLarge={true}>
          <div className="p-2">
            <ReactMarkdown
              className="react-markdown-container"
              /* Prevents HTML embedded in the description from rendering */
              skipHtml={true}
              /* Stops users embedding images which could be used for tracking  */
              disallowedElements={['img']}
              linkTarget="_blank"
            >
              {description}
            </ReactMarkdown>
          </div>
        </RoundedWrapper>
      )}
    </section>
  );
};
