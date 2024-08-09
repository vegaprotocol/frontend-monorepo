import {
  ExternalLink as ExLink,
  // Link,
  // VegaIcon,
  // VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
// import { cn } from '@vegaprotocol/utils';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

// import { getExtensionApi } from '@/lib/extension-apis';
// import { useGlobalsStore } from '@/stores/globals';

type LinkProperties = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: ReactNode;
};

export const locators = {
  externalLink: 'external-link',
};

// const MobileLink = ({
//   children,
//   className,
//   href,
//   ...properties
// }: LinkProperties) => {
//   const openInNewTab = () => {
//     const api = getExtensionApi();
//     api.tabs.create({ url: href });
//   };
//   return (
//     <Link
//       data-testid={locators.externalLink}
//       onClick={openInNewTab}
//       className={cn(
//         'inline-flex items-center gap-1 underline-offset-4',
//         className
//       )}
//       {...properties}
//     >
//       {typeof children === 'string' ? (
//         <>
//           <span
//             className={cn({ underline: typeof children === 'string' })}
//           >
//             {children}
//           </span>
//           <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={13} />
//         </>
//       ) : (
//         children
//       )}
//     </Link>
//   );
// };

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
