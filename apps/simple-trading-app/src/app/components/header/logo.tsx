import React from 'react';
import { NavLink } from 'react-router-dom';
import { t } from '@vegaprotocol/react-helpers';
import { VLogo } from '@vegaprotocol/ui-toolkit';

const Logo = () => {
  return (
    <NavLink
      className="mx-20 text-white"
      aria-label={t('Go to home page')}
      to="/"
    >
      <VLogo />
    </NavLink>
  );
};

export default Logo;
