import { Link } from 'react-router-dom';
import { VegaLogo } from '@vegaprotocol/ui-toolkit';

export const Navbar = () => {
  return (
    <div className="px-8 py-4 flex items-stretch border-b border-greys-light-200">
      <div className="flex gap-4 mr-4 items-center h-full">
        <Link to="/">
          <VegaLogo />
        </Link>
      </div>
      <div className="flex items-center gap-2 ml-auto"></div>
    </div>
  );
};
