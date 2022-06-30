import React, { useContext } from 'react';
import classNames from 'classnames';
import { ThemeContext } from '@vegaprotocol/react-helpers';

const Logo = () => {
  const theme = useContext(ThemeContext);
  return (
    <svg
      width="38"
      height="44"
      fill="currentColor"
      viewBox="0 0 29 34"
      className={classNames('m-12', {
        'text-black-100': theme === 'dark',
        'text-white-100': theme === 'light',
      })}
    >
      <path d="M14.5003 29.1426H9.6665V34.0001H14.5003V29.1426Z" />
      <path d="M19.3343 24.2859H14.5005V29.1434H19.3343V24.2859Z" />
      <path d="M29.0008 19.4282H24.167V24.2857H29.0008V19.4282Z" />
      <path d="M24.1673 0H19.3335V19.4283H24.1673V0Z" />
      <path d="M9.66776 24.2859H4.83398V29.1434H9.66776V24.2859Z" />
      <path d="M4.83378 0H0V24.2858H4.83378V0Z" />
    </svg>
  );
};

export default Logo;
