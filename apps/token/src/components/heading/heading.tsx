import classNames from 'classnames';

interface HeadingProps {
  title?: string;
  centerContent?: boolean;
}

export const Heading = ({ title, centerContent = true }: HeadingProps) => {
  if (!title) return null;

  return (
    <header
      className={classNames('my-0', {
        'mx-auto': centerContent,
      })}
    >
      <h1 className="font-alpha calt">{title}</h1>
    </header>
  );
};
