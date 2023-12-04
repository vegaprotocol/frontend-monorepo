import classNames from 'classnames';

interface HeadingProps {
  title?: string;
  centerContent?: boolean;
  marginTop?: boolean;
  marginBottom?: boolean;
}

export const Heading = ({
  title,
  centerContent = true,
  marginTop = true,
  marginBottom = true,
}: HeadingProps) => {
  if (!title) return null;

  return (
    <header
      className={classNames('mb-6', {
        'mx-auto': centerContent,
        'mt-10': marginTop,
      })}
    >
      <h1
        className={classNames(
          'font-alpha calt text-5xl [word-break:break-word]',
          {
            'mt-0': !marginTop,
            'mb-0': !marginBottom,
          }
        )}
      >
        {title}
      </h1>
    </header>
  );
};

export const SubHeading = ({
  title,
  centerContent = false,
  marginBottom = true,
}: HeadingProps) => {
  if (!title) return null;

  return (
    <h2
      className={classNames('text-2xl font-alpha calt uppercase break-words', {
        'mx-auto': centerContent,
        'mb-0': !marginBottom,
        'mb-4': marginBottom,
      })}
    >
      {title}
    </h2>
  );
};
