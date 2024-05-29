import React from 'react';
import { Routes } from '../../../routes/route-names';
import { Link } from 'react-router-dom';

import type { ComponentProps } from 'react';
import Hash from '../hash';

export type NetworkParameterLinkProps = Partial<ComponentProps<typeof Link>> & {
  parameter: string;
};

/**
 * Links a given network parameter to the relevant page and anchor on the page
 */
export const NetworkParameterLink = ({
  parameter,
  ...props
}: NetworkParameterLinkProps) => {
  return (
    <Link
      className="underline"
      {...props}
      to={`/${Routes.NETWORK_PARAMETERS}#${parameter}`}
    >
      <Hash text={parameter} />
    </Link>
  );
};

export default NetworkParameterLink;
