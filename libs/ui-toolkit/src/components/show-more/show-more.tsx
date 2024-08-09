import { cn } from '../../utils/cn';
import { useRef, useState, useEffect } from 'react';
import { Button } from '../button';
import type { ReactNode } from 'react';
import { useT } from '../../use-t';

type ShowMoreProps = {
  children: ReactNode;
  closedMaxHeightPx?: number;
  overlayColourOverrides?: string;
};

export const ShowMore = ({
  children,
  closedMaxHeightPx = 125,
  overlayColourOverrides,
}: ShowMoreProps) => {
  const t = useT();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const checkHeight = () => {
      const container = containerRef.current;
      if (container) {
        container.scrollHeight < closedMaxHeightPx
          ? setExpanded(true)
          : setExpanded(false);
      }
    };

    checkHeight();

    window.addEventListener('resize', checkHeight);

    return () => {
      window.removeEventListener('resize', checkHeight);
    };
  }, [closedMaxHeightPx]);

  const containerClasses = cn(
    'overflow-hidden transition-all ease-in-out duration-300',
    {
      'max-h-none': expanded,
    }
  );

  const overlayClasses = cn(
    `absolute w-full h-16 bottom-0 left-0 transition-opacity duration-300 bg-gradient-to-b from-transparent ${
      overlayColourOverrides ? overlayColourOverrides : 'to-white dark:to-black'
    }`,
    {
      hidden: expanded,
    }
  );

  return (
    <>
      <div className="relative">
        <div
          ref={containerRef}
          className={containerClasses}
          style={{ maxHeight: expanded ? 'none' : `${closedMaxHeightPx}px` }}
        >
          {children}
        </div>
        <div className={overlayClasses}></div>
      </div>

      {!expanded && (
        <div className="mt-1 text-center">
          <Button
            size={'sm'}
            onClick={() => setExpanded(true)}
            data-testid="show-more-btn"
          >
            {t('Show more')}
          </Button>
        </div>
      )}
    </>
  );
};
