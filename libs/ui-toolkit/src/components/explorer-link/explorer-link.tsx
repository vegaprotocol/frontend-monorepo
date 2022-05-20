import classNames from 'classnames';
import type { ReactNode, HTMLProps } from 'react';

const EXPLORER_URL = process.env['NX_EXPLORER_URL'] as string;

type ExplorerEntity = 'block' | 'party';

type ExplorerLinkProps = HTMLProps<HTMLAnchorElement> & {
  entity: ExplorerEntity;
  id?: string;
  children?: ReactNode;
};

const entityUrlMap: Record<ExplorerEntity, string> = {
  block: 'blocks',
  party: 'parties',
};

/**
 * Form an HTML link tag pointing to an appropriate Explorer page
 */
export const ExplorerLink = ({
  id,
  entity,
  children,
  className,
  ...props
}: ExplorerLinkProps) => {
  const element = children ?? id ?? entityUrlMap[entity];
  const anchorClasses =
    typeof element === 'string'
      ? classNames('underline', className)
      : className;

  const url = [EXPLORER_URL, entityUrlMap[entity], id]
    .filter((chunk) => !!chunk)
    .join('/');

  return (
    <a
      data-testid="explorer-link"
      href={url}
      target="_blank"
      rel="noreferrer"
      className={anchorClasses}
      {...props}
    >
      {element}
    </a>
  );
};

ExplorerLink.displayName = 'EtherScanLink';
