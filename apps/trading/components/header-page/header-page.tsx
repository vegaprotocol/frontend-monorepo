import { type ReactNode } from 'react';

export const HeaderPage = (props: { children: ReactNode }) => {
  return <h1 className="text-3xl lg:text-5xl calt">{props.children}</h1>;
};
