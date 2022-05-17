import * as React from 'react';
import { theme } from '@vegaprotocol/tailwindcss-config';
import type { ReactElement } from 'react';
import { useEffect } from 'react';
import Drawer from '@mui/material/Drawer';

interface Props {
  children?: ReactElement | ReactElement[];
  isMenuOpen?: boolean;
  onToggle(): void;
}

export const NavigationDrawer = ({
  isMenuOpen = false,
  onToggle,
  children,
}: Props) => {
  const [windowSize, setWindowSize] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const mobileScreenWidth = parseInt(theme.screens.md);
  const isMobile = windowSize.width <= mobileScreenWidth;
  const timeout = React.useRef(0);

  const handleResize = () => {
    if (timeout.current) {
      window.cancelAnimationFrame(timeout.current);
    }

    // Setup the new requestAnimationFrame()
    timeout.current = window.requestAnimationFrame(function () {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    });
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(timeout.current);
    };
  }, []);

  const drawerRootClasses = {
    root: 'w-3/4 md:w-1/4 shrink-0',
    paper: 'p-16 w-3/4 md:w-1/4 box-border',
  };

  return (
    <Drawer
      classes={drawerRootClasses}
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? isMenuOpen : true}
      onClose={onToggle}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      {children}
    </Drawer>
  );
};
