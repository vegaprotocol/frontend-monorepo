import ReactMarkdown from 'react-markdown';
import { RoundedWrapper, ShowMore } from '@vegaprotocol/ui-toolkit';

export const ProposalDescription = ({
  description,
}: {
  description: string;
}) => (
  <section data-testid="proposal-description">
    <RoundedWrapper paddingBottom={true} marginBottomLarge={true}>
      <div className="p-2">
        <ShowMore>
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
        </ShowMore>
      </div>
    </RoundedWrapper>
  </section>
);
