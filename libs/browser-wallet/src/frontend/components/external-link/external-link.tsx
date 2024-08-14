import { ExternalLink as ExLink } from '@vegaprotocol/ui-toolkit';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

type LinkProperties = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: ReactNode;
};

export const locators = {
  externalLink: 'external-link',
};

export const ExternalLink = ({
  children,
  className,
  ...properties
}: LinkProperties) => {
  return (
    <ExLink
      data-testid={locators.externalLink}
      className={className}
      {...properties}
    >
      {children ?? properties.href}
    </ExLink>
  );
};
