import type { ReactNode } from 'react';
import classNames from 'classnames';
import { getIntentShadow, Intent } from '../../utils/intent';
import { Loader } from '../loader';
import type { IconName } from '../icon';
import { Icon } from '../icon';

interface CalloutRootProps {
  children?: React.ReactNode;
  title?: React.ReactElement | string;
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
  const wrapperClassName = 'ml-8 mr-16 mt-8';
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
  return <div className={wrapperClassName}>{icon}</div>;
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
    'border',
    'border-black',
    'dark:border-white',
    'text-body-large',
    'dark:text-white',
    'p-16',
    getIntentShadow(intent),
    {
      flex: iconElement,
    }
  );
  const TitleTag: keyof JSX.IntrinsicElements = headingLevel
    ? `h${headingLevel}`
    : 'div';
  const body = (
    <>
      {title && <TitleTag className="text-h5 mt-0 mb-8">{title}</TitleTag>}
      {children}
    </>
  );
  return (
    <div data-testid="callout" className={className}>
      {iconElement}
      {iconElement ? <div className="grow">{body}</div> : body}
    </div>
  );
}
