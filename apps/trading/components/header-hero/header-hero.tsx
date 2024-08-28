import { type ReactNode } from 'react';

export const HeaderHero = (props: {
  title: ReactNode;
  children: ReactNode;
}) => {
  return (
    <header className="relative lg:py-10">
      <div className="sm:w-1/2">
        <h1 className="text-3xl lg:text-6xl leading-[1em] font-alt calt mb-2 lg:mb-10">
          {props.title}
        </h1>
        <div className="flex flex-col gap-3 text-lg">{props.children}</div>
      </div>
    </header>
  );
};
