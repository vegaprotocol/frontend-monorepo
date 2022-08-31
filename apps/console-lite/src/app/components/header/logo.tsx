import React from 'react';
import { NavLink } from 'react-router-dom';
import { t } from '@vegaprotocol/react-helpers';
import { VLogo } from '@vegaprotocol/ui-toolkit';

const Logo = () => {
  return (
    <NavLink
      className="mx-6 text-white"
      aria-label={t('Go to home page')}
      to="/"
    >
      <VLogo className="mx-6 my-2" />
    </NavLink>
  );
};

export default Logo;
