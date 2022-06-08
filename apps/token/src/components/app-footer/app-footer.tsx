import { Link } from '@vegaprotocol/ui-toolkit';
import { Trans } from 'react-i18next';

import { Links } from '../../config';

export const AppFooter = () => {
  return (
    <footer className="p-12 text-ui">
      <p className="mb-8">
        Version: {process.env['NX_COMMIT_REF'] || 'development'}
      </p>
      <p>
        <Trans
          i18nKey="footerLinksText"
          components={{
            /* eslint-disable */
            feedbackLink: (
              <Link className="text-white underline" href={Links.FEEDBACK} />
            ),
            githubLink: (
              <Link className="text-white underline" href={Links.GITHUB} />
            ),
            /* eslint-enable */
          }}
        />
      </p>
    </footer>
  );
};
