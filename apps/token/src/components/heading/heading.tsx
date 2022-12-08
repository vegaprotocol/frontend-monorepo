import classNames from 'classnames';

interface HeadingProps {
  title?: string;
  centerContent?: boolean;
  marginBottom?: boolean;
}

export const Heading = ({
  title,
  centerContent = true,
  marginBottom = true,
}: HeadingProps) => {
  if (!title) return null;

  return (
    <header
      className={classNames('mt-12 mb-6', {
        'mx-auto': centerContent,
      })}
    >
      <h1
        className={classNames('font-alpha calt text-5xl', {
          'mb-0': !marginBottom,
        })}
      >
        {title}
      </h1>
    </header>
  );
};
