import { useWeb3React } from "@web3-react/core";
import { useTranslation } from "react-i18next";

import { EthConnectPrompt } from "../../components/eth-connect-prompt";
import { Heading } from "../../components/heading";
import { SplashLoader } from "../../components/splash-loader";
import { SplashScreen } from "../../components/splash-screen";
import { useDocumentTitle } from "../../hooks/use-document-title";
import { useTranches } from "../../hooks/use-tranches";
import { RouteChildProps } from "..";
import Claim from "./claim";
import { ClaimRestricted } from "./claim-restricted";
import { isRestricted } from "./lib/is-restricted";

const ClaimIndex = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);
  const { t } = useTranslation();
  const { account } = useWeb3React();
  const { tranches } = useTranches();

  if (!tranches) {
    return (
      <SplashScreen>
        <SplashLoader />
      </SplashScreen>
    );
  }

  let content = null;

  if (!account) {
    content = (
      <EthConnectPrompt>
        <p data-testid="eth-connect-prompt">
          {t(
            "Use the Ethereum wallet you want to send your tokens to. You'll also need enough Ethereum to pay gas."
          )}
        </p>
      </EthConnectPrompt>
    );
  } else {
    content = isRestricted() ? (
      <ClaimRestricted />
    ) : (
      <Claim address={account} tranches={tranches} />
    );
  }

  return (
    <>
      <Heading title={t("pageTitleClaim")} />
      {content}
    </>
  );
};

export default ClaimIndex;
