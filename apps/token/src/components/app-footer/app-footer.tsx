import { Trans } from 'react-i18next';

import { Links } from '../../config';
import { ENV } from '../../config/env';

export const AppFooter = () => {
  return (
    <footer className="p-12 text-ui">
      <p className="mb-8">
        Version: {ENV.commit || 'development'}
      </p>
      <p>
        <Trans
          i18nKey="footerLinksText"
          components={{
            /* eslint-disable */
            feedbackLink: <a href={Links.FEEDBACK} />,
            githubLink: <a href={Links.GITHUB} />,
            /* eslint-enable */
          }}
        />
      </p>
    </footer>
  );
};
