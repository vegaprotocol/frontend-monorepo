import type { ReactNode, ReactElement } from 'react';
import classNames from 'classnames';
import { getIntentBorder, Intent } from '../../utils/intent';
import { Loader } from '../loader';
import type { IconName } from '../icon';
import { Icon } from '../icon';

interface CalloutRootProps {
  children?: ReactNode;
  title?: ReactElement | string;
  intent?: Intent;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  isLoading?: boolean;
}

interface CalloutWithoutIcon extends CalloutRootProps {
  iconName?: never;
  iconDescription?: never;
  icon?: never;
}

interface CalloutPropsWithIconName extends CalloutRootProps {
  iconName: IconName;
  iconDescription?: string;
  icon?: never;
}

interface CalloutPropsWithIcon extends CalloutRootProps {
  iconName?: never;
  iconDescription?: never;
  icon: ReactNode;
}

type CalloutProps =
  | CalloutWithoutIcon
  | CalloutPropsWithIconName
  | CalloutPropsWithIcon;

const getIconElement = ({
  icon,
  iconName,
  iconDescription,
  isLoading,
}: Pick<
  CalloutProps,
  'icon' | 'iconName' | 'iconDescription' | 'isLoading'
>) => {
  const wrapperClassName = 'mt-4';
  if (isLoading) {
    return (
      <div className={wrapperClassName}>
        <Loader size="small" />
      </div>
    );
  }
  if (iconName) {
    return (
      <Icon
        name={iconName}
        className={classNames(wrapperClassName, 'fill-current')}
        size={20}
        aria-label={iconDescription}
        aria-hidden={!iconDescription}
      />
    );
  }
  if (icon) {
    return <div className={wrapperClassName}>{icon}</div>;
  }
  return null;
};

export function Callout({
  children,
  title,
  icon,
  iconName,
  iconDescription,
  isLoading,
  intent = Intent.None,
  headingLevel,
}: CalloutProps) {
  const iconElement = getIconElement({
    icon,
    iconName,
    iconDescription,
    isLoading,
  });

  const className = classNames(
    'flex gap-20',
    'text-body-large',
    'dark:text-white',
    'p-16',
    getIntentBorder(intent)
  );
  const TitleTag: keyof JSX.IntrinsicElements = headingLevel
    ? `h${headingLevel}`
    : 'div';
  const body = (
    <>
      {title && (
        <TitleTag className="text-h5 mt-0 mb-8 last:mb-0">{title}</TitleTag>
      )}
      {children}
    </>
  );
  return (
    <div data-testid="callout" className={className}>
      {iconElement}
      <div className="grow">{body}</div>
    </div>
  );
}
