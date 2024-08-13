import { cn } from '@vegaprotocol/ui-toolkit';
import { type ReactNode } from 'react';

interface HeadingProps {
  title?: ReactNode;
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
      className={cn('mb-6', {
        'mx-auto': centerContent,
        'mt-10': marginTop,
      })}
    >
      <h1
        className={cn('font-alt calt text-5xl [word-break:break-word]', {
          'mt-0': !marginTop,
          'mb-0': !marginBottom,
        })}
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
      className={cn('text-2xl font-alt calt break-words', {
        'mx-auto': centerContent,
        'mb-0': !marginBottom,
        'mb-4': marginBottom,
      })}
    >
      {title}
    </h2>
  );
};
