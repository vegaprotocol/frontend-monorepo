import classNames from 'classnames';
import type { AnchorHTMLAttributes } from 'react';

const ETHERSCAN_URL = process.env['NX_ETHERSCAN_URL'] as string;

interface BaseEtherscanLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  text?: string;
}

interface EtherscanAddressLinkProps extends BaseEtherscanLinkProps {
  address: string;
}

interface EtherscanTransactionLinkProps extends BaseEtherscanLinkProps {
  tx: string;
}

type EtherscanLinkProps =
  | EtherscanAddressLinkProps
  | EtherscanTransactionLinkProps;

/**
 * Form an HTML link tag pointing to an appropriate Etherscan page
 */
export const EtherscanLink = ({
  text,
  className,
  ...props
}: EtherscanLinkProps) => {
  let hash: string;
  let txLink: string | null;
  const anchorClasses = classNames('underline', className);

  if ('tx' in props) {
    hash = props.tx;
    txLink = `${ETHERSCAN_URL}/tx/${hash}`;
  } else if ('address' in props) {
    hash = props.address;
    txLink = `${ETHERSCAN_URL}/address/${hash}`;
  } else {
    throw new Error('Must provider either "tx" or "address" prop');
  }

  const linkText = text ? text : hash;

  // Fallback: just render the TX id
  if (!txLink) {
    return <span>{hash}</span>;
  }

  return (
    <a
      data-testid="etherscan-link"
      href={txLink}
      target="_blank"
      rel="noreferrer"
      className={anchorClasses}
    >
      {linkText}
    </a>
  );
};

EtherscanLink.displayName = 'EtherScanLink';
