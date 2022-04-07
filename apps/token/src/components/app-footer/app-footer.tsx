import "./app-footer.scss";

import { Trans } from "react-i18next";

import { Links } from "../../config";

export const AppFooter = () => {
  return (
    <footer className="app-footer">
      <p>Version: {process.env.COMMIT_REF || "development"}</p>
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
