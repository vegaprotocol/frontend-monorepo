import type { ComponentType } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export interface RouterProperties {
  navigate: NavigateFunction;
}

export function withRouter<P extends RouterProperties>(
  Component: ComponentType<P>
) {
  const Wrapper = (properties: Omit<P, keyof RouterProperties>) => {
    const navigate = useNavigate();
    const routerProperties = { navigate };

    return <Component {...routerProperties} {...(properties as P)} />;
  };

  return Wrapper;
}
