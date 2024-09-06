import { type ReactNode } from 'react';

export const HeaderHero = (props: {
  title: ReactNode;
  children: ReactNode;
}) => {
  return (
    <header className="relative lg:py-10">
      <div className="sm:w-1/2">
        <h1 className="text-3xl lg:text-6xl leading-[1em] mb-2 lg:mb-10 font-sans font-semibold">
          <span className="bg-clip-text text-transparent bg-gradient-to-tl from-highlight-fg to-highlight-fg via-highlight-secondary-fg via-30%">
            {props.title}
          </span>
        </h1>
        <div className="flex flex-col gap-3 text-lg">{props.children}</div>
      </div>
    </header>
  );
};
