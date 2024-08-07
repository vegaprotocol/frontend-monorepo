import { ButtonLink, Dialog } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';

import { ExternalLink } from '@/components/external-link';

export const locators = {
  disclaimerText: 'disclaimer-text',
  dialog: 'disclaimer-dialog',
  readMoreButton: 'read-more-button',
  previewText: 'preview-text',
  dataPolicyLink: 'data-policy-link',
  feedbackLink: 'feedback-link',
};

export const DisclaimerText = () => {
  return (
    <section data-testid={locators.disclaimerText} className="text-xs">
      <p className="mb-2">
        The Vega Wallet is an application that allows users to, among other
        things, (i) access other Vega applications; (ii) manage multiple wallets
        and keys; and (iii) sign transactions on the Vega network. It is free,
        public and open source software.
      </p>
      <p className="mb-2">
        The Vega Wallet is purely non-custodial application, meaning users never
        lose custody, possession, or control of their digital assets at any
        time. Users are solely responsible for the custody of the cryptographic
        private keys to their Vega Wallet and and should never share their seed
        phrase with anyone.
      </p>
      <p className="mb-2">
        The Vega Wallet relies on emerging technologies that are subject to
        risks such as misuse of public/private key cryptography or failing to
        properly update or run the latest software. The developers of the Vega
        Wallet do not operate or run the Vega Blockchain or any other
        blockchain. Digital tokens present market volatility risk, technical
        software risk, regulatory risk and cybersecurity risk. Software upgrades
        may contain bugs or security vulnerabilities that might result in loss
        of functionality or assets.
      </p>
      <p className="mb-2">
        The Vega Wallet is provided “as is”. The developers of the Vega Wallet
        make no representations or warranties of any kind, whether express or
        implied, statutory or otherwise regarding the Vega Wallet. They disclaim
        all warranties of merchantability, quality, fitness for purpose. They
        disclaim all warranties that the Vega Wallet is free of harmful
        components or errors.
      </p>
      <p className="mb-2">
        No developer of the Vega Wallet accepts any responsibility for, or
        liability to users in connection with their use of the Vega Wallet.
        Users are solely responsible for any associated wallet and no developer
        of the Vega Wallet is liable for any acts or omissions by users in
        connection with or as a result of their Vega Wallet or other associated
        wallet being compromised.
      </p>
      <p className="mb-2">
        By using the Vega Wallet, you acknowledge that you have read and
        understood the Vega Wallet User Data Policy here:{' '}
        <ExternalLink
          className="underline"
          data-testid={locators.dataPolicyLink}
          href="https://vega.xyz/vega-wallet-user-data-policy/"
        >
          https://vega.xyz/vega-wallet-user-data-policy/
        </ExternalLink>
      </p>
      <p className="mb-2">
        Spot an issue? Provide feedback here:{' '}
        <ExternalLink
          className="underline"
          data-testid={locators.feedbackLink}
          href="https://github.com/vegaprotocol/feedback/discussions"
        >
          https://github.com/vegaprotocol/feedback/discussions
        </ExternalLink>
      </p>
    </section>
  );
};

export const Disclaimer = () => {
  const [open, setOpen] = useState(false);
  return (
    <section className="text-xs">
      <Dialog open={open} onChange={setOpen} dataTestId={locators.dialog}>
        <DisclaimerText />
      </Dialog>
      <p className="text-xs" data-testid={locators.previewText}>
        The Vega Wallet is purely non-custodial application, meaning users never
        lose custody, possession, or control of their digital assets at any
        time. Users are solely responsible for the custody of the cryptographic
        private keys to their Vega Wallet and and should never share their seed
        phrase with anyone.
      </p>
      <ButtonLink
        onClick={() => setOpen(true)}
        data-testid={locators.readMoreButton}
      >
        Read more
      </ButtonLink>
    </section>
  );
};
