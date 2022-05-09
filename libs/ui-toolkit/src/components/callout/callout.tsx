import type { ReactNode } from 'react';
import classNames from 'classnames';
import { getIntentShadow, Intent } from '../../utils/intent';
import type { IconName } from '../icon';
import { Icon } from '../icon';

interface CalloutRootProps {
  children?: React.ReactNode;
  title?: React.ReactElement | string;
  intent?: Intent;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

interface CalloutWithoutIcon extends CalloutRootProps {
  iconName?: never;
  icon?: never;
}

interface CalloutPropsWithIconName extends CalloutRootProps {
  children?: React.ReactNode;
  title?: React.ReactElement | string;
  intent?: Intent;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  iconName: IconName;
  icon?: never;
}

interface CalloutPropsWithIcon extends CalloutRootProps {
  children?: React.ReactNode;
  title?: React.ReactElement | string;
  intent?: Intent;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  iconName?: never;
  icon: ReactNode;
}

type CalloutProps =
  | CalloutWithoutIcon
  | CalloutPropsWithIconName
  | CalloutPropsWithIcon;

const getIconElement = (props: CalloutProps) => {
  if (props.iconName) {
    return (
      <Icon
        name={props.iconName}
        className="fill-current ml-8 mr-16 mt-8"
        size={20}
      />
    );
  }
  return props.icon;
};

export function Callout(props: CalloutProps) {
  const { children, title, intent = Intent.Help, headingLevel } = props;

  const icon = getIconElement(props);

  const className = classNames(
    'border',
    'border-black',
    'dark:border-white',
    'text-body-large',
    'dark:text-white',
    'p-16',
    getIntentShadow(intent),
    {
      flex: !!icon,
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
      {icon}
      {icon ? <div className="grow">{body}</div> : body}
    </div>
  );
}
