import "./etherscan-link.scss";

import { Popover, PopoverInteractionKind } from "@blueprintjs/core";
import { useWeb3React } from "@web3-react/core";
import { useTranslation } from "react-i18next";

import { EthereumChainId } from "../../config";
import { useCopyToClipboard } from "../../hooks/use-copy-to-clipboard";

const etherscanUrls: Record<EthereumChainId, string> = {
  "0x1": "https://etherscan.io",
  "0x3": "https://ropsten.etherscan.io",
  "0x4": "https://rinkeby.etherscan.io",
  "0x5": "https://goerli.etherscan.io",
  "0x2a": "https://kovan.etherscan.io",
};

interface BaseEtherscanLinkProps {
  text?: string;
  copyToClipboard?: CopyToClipboardType;
  className?: string;
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

export enum CopyToClipboardType {
  NONE,
  TEXT,
  LINK,
}

/**
 * Form an HTML link tag pointing to an appropriate Etherscan page
 */
export const EtherscanLink = ({
  text,
  className,
  copyToClipboard = CopyToClipboardType.NONE,
  ...props
}: EtherscanLinkProps) => {
  const { chainId } = useWeb3React();
  let hash: string;
  let href: string | null;
  const { t } = useTranslation();
  const { copy, copied } = useCopyToClipboard();
  const linkText = text ? text : t("View on Etherscan (opens in a new tab)");
  const createLink = etherscanLinkCreator(`0x${chainId}` as EthereumChainId);

  if ("tx" in props) {
    hash = props.tx;
    href = createLink ? createLink.tx(hash) : null;
  } else {
    hash = props.address;
    href = createLink ? createLink.address(hash) : null;
  }

  // Fallback: just render the address/txHash
  if (!href) {
    return <span>{hash}</span>;
  }

  const generateClipboard = () => {
    switch (copyToClipboard) {
      case CopyToClipboardType.TEXT:
        return linkText;
      case CopyToClipboardType.LINK:
        return href || hash || "";
      default:
        return "";
    }
  };

  const getContents = (): JSX.Element => {
    return (
      <button
        className="etherscan-link__copy-to-clipboard"
        onClick={() => {
          copy(generateClipboard());
        }}
      >
        {copied ? t("copied!") : t("copyToClipboard")}
      </button>
    );
  };

  const linkProps = {
    target: "_blank",
    rel: "noreferrer",
    href,
    className,
  };

  return copyToClipboard !== CopyToClipboardType.NONE ? (
    <Popover
      hoverOpenDelay={500}
      interactionKind={PopoverInteractionKind.HOVER}
    >
      <a {...linkProps}>{linkText}</a>
      {getContents()}
    </Popover>
  ) : (
    <a {...linkProps}>{linkText}</a>
  );
};

function etherscanLinkCreator(chainId: EthereumChainId | null) {
  if (!chainId) return null;

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

EtherscanLink.displayName = "EtherscanLink";
