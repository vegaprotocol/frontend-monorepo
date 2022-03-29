import classNames from 'classnames';
import type { AnchorHTMLAttributes } from 'react';
import React from 'react';

const etherscanUrls: Record<number, string> = {
  1: 'https://etherscan.io',
  3: 'https://ropsten.etherscan.io',
};

interface BaseEtherscanLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  chainId: number;
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
  chainId,
  text,
  className,
  ...props
}: EtherscanLinkProps) => {
  let hash: string;
  let txLink: string | null;
  const createLink = React.useMemo(
    () => etherscanLinkCreator(chainId),
    [chainId]
  );
  const anchorClasses = classNames('underline', className);

  if ('tx' in props) {
    hash = props.tx;
    txLink = createLink ? createLink.tx(hash) : null;
  } else if ('address' in props) {
    hash = props.address;
    txLink = createLink ? createLink.address(hash) : null;
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

function etherscanLinkCreator(chainId: number) {
  const url = etherscanUrls[chainId];

  return {
    tx: (tx: string) => {
      if (!url) return null;
      return `${url}/tx/${tx}`;
    },
    address: (address: string) => {
      if (!url) return null;
      return `${url}/address/${address}`;
    },
  };
}

EtherscanLink.displayName = 'EtherScanLink';
