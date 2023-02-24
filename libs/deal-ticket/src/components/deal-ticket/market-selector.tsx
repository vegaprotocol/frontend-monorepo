import type { ReactNode } from 'react';
import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import * as DialogPrimitives from '@radix-ui/react-dialog';
import classNames from 'classnames';
import {
  ButtonLink,
  Icon,
  Input,
  Loader,
  Splash,
} from '@vegaprotocol/ui-toolkit';
import {
  useScreenDimensions,
  useOutsideClick,
  useDataProvider,
} from '@vegaprotocol/react-helpers';
import { t } from '@vegaprotocol/utils';
import { IconNames } from '@blueprintjs/icons';
import * as Schema from '@vegaprotocol/types';
import type { Market } from '@vegaprotocol/market-list';
import { marketsProvider } from '@vegaprotocol/market-list';

interface Props {
  market: Market;
  setMarket: (marketId: string) => void;
  ItemRenderer?: React.FC<{
    market: Market;
    isMobile?: boolean;
  }>;
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const MarketSelector = ({ market, setMarket, ItemRenderer }: Props) => {
  const { isMobile } = useScreenDimensions();
  const contRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const arrowButtonRef = useRef<HTMLButtonElement | null>(null);
  const [results, setResults] = useState<Market[]>([]);
  const [showPane, setShowPane] = useState(false);
  const [lookup, setLookup] = useState(
    market.tradableInstrument.instrument.name || ''
  );
  const [dialogContent, setDialogContent] = useState<React.ReactNode | null>(
    null
  );

  const { data, loading, error } = useDataProvider({
    dataProvider: marketsProvider,
    skipUpdates: true,
  });

  const outsideClickCb = useCallback(() => {
    if (!isMobile) {
      setShowPane(false);
    }
  }, [setShowPane, isMobile]);

  useOutsideClick({ refs: [contRef, arrowButtonRef], func: outsideClickCb });

  const handleOnChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const {
        target: { value },
      } = event;
      setLookup(value);
      setShowPane(true);
    },
    [setLookup, setShowPane]
  );

  const handleMarketSelect = useCallback(
    (market: {
      id: string;
      tradableInstrument: { instrument: { name: string } };
    }) => {
      setLookup(market.tradableInstrument.instrument.name);
      setShowPane(false);
      setMarket(market.id);
      inputRef.current?.focus();
    },
    [setLookup, setShowPane, setMarket, inputRef]
  );

  const handleItemKeyDown = useCallback(
    (event: React.KeyboardEvent, market: Market, index: number) => {
      switch (event.key) {
        case 'ArrowDown':
          if (index < results.length - 1) {
            (contRef.current?.children[index + 1] as HTMLDivElement).focus();
          }
          break;

        case 'ArrowUp':
          if (!index) {
            inputRef.current?.focus();
            inputRef.current?.setSelectionRange(
              inputRef.current?.value.length,
              inputRef.current?.value.length
            );
            return;
          }
          (contRef.current?.children[index - 1] as HTMLDivElement).focus();
          break;

        case 'Enter':
          event.preventDefault();
          handleMarketSelect(market);
          break;
        default:
          setShowPane(false);
          setLookup(market.tradableInstrument.instrument.name);
      }
    },
    [results, handleMarketSelect]
  );

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        (contRef.current?.children[0] as HTMLDivElement)?.focus();
      }
    },
    [contRef]
  );

  const handleOnBlur = useCallback(() => {
    if (!lookup && !showPane) {
      setLookup(market.tradableInstrument.instrument.name);
    }
  }, [market, lookup, showPane, setLookup]);

  const openPane = useCallback(() => {
    setShowPane(!showPane);
    inputRef.current?.focus();
  }, [showPane, setShowPane, inputRef]);

  const handleDialogOnchange = useCallback(
    (isOpen: boolean) => {
      setShowPane(isOpen);
      if (!isOpen) {
        setLookup(lookup || market.tradableInstrument.instrument.name);
        inputRef.current?.focus();
      }
    },
    [
      setShowPane,
      lookup,
      setLookup,
      market.tradableInstrument.instrument.name,
      inputRef,
    ]
  );

  const selectorContent = useMemo(() => {
    return (
      <div className="relative flex flex-col">
        <div className="relative w-full min-h-[30px]">
          <Input
            className="h-[30px] w-[calc(100%-20px)] border-none outline-none"
            ref={inputRef}
            tabIndex={0}
            value={lookup}
            placeholder={t('Search')}
            onChange={handleOnChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleOnBlur}
          />
          <span className="absolute self-end top-0 right-0 z-10">
            <ButtonLink
              onClick={openPane}
              ref={arrowButtonRef}
              data-testid="arrow-button"
            >
              <Icon
                name={IconNames.ARROW_DOWN}
                className={classNames('fill-current transition-transform', {
                  'rotate-180': showPane,
                })}
              />
            </ButtonLink>
          </span>
        </div>
        <hr className="mb-2" />
        <div
          className={classNames(
            'md:absolute z-20 flex flex-col top-[30px] md:drop-shadow-md md:border md:border-black md:dark:border-white bg-white dark:bg-black text-black dark:text-white min-w-full md:max-h-[200px] overflow-y-auto',
            showPane ? 'block' : 'hidden'
          )}
          data-testid="market-pane"
        >
          {loading && (
            <div className="p-4">
              <Loader size="small" />
            </div>
          )}
          {error && (
            <Splash>{t(`Something went wrong: ${error.message}`)}</Splash>
          )}
          <div ref={contRef} className="w-full">
            {results.map((market, i) => (
              <div
                role="button"
                tabIndex={0}
                key={market.id}
                className="bg-white dark:bg-black cursor-pointer px-4 py-2"
                onClick={() => handleMarketSelect(market)}
                onKeyDown={(e) => handleItemKeyDown(e, market, i)}
              >
                {ItemRenderer ? (
                  <ItemRenderer market={market} />
                ) : (
                  market.tradableInstrument.instrument.name
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }, [
    ItemRenderer,
    error,
    handleInputKeyDown,
    handleItemKeyDown,
    handleMarketSelect,
    handleOnBlur,
    handleOnChange,
    loading,
    lookup,
    openPane,
    results,
    showPane,
  ]);

  useEffect(() => {
    setResults(
      data?.filter(
        (item) =>
          item.state === Schema.MarketState.STATE_ACTIVE &&
          item.tradableInstrument.instrument.name.match(
            new RegExp(escapeRegExp(lookup), 'i')
          )
      ) || []
    );
  }, [data, lookup]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  useEffect(() => {
    if (showPane && isMobile) {
      setDialogContent(selectorContent);
      inputRef.current?.focus();
      window.scrollTo(0, 0);
    } else {
      setDialogContent(null);
    }
  }, [selectorContent, showPane, isMobile, setDialogContent]);

  return (
    <>
      {!dialogContent && selectorContent}
      <MarketDrawer
        open={Boolean(dialogContent)}
        onChange={handleDialogOnchange}
      >
        {dialogContent}
      </MarketDrawer>
    </>
  );
};

interface MarketDrawerProps {
  children: ReactNode;
  open: boolean;
  onChange?: (isOpen: boolean) => void;
}

export const MarketDrawer = ({
  children,
  open,
  onChange,
}: MarketDrawerProps) => {
  const contentClasses = classNames(
    // Positions the modal in the center of screen
    'z-20 fixed p-8 inset-x-1/2 dark:text-white w-screen',
    // Need to apply background and text colors again as content is rendered in a portal
    'dark:bg-black bg-white',
    'left-[0px] top-[99px] h-[calc(100%-99px)] overflow-y-auto'
  );
  return (
    <DialogPrimitives.Root open={open} onOpenChange={(x) => onChange?.(x)}>
      <DialogPrimitives.Portal>
        <DialogPrimitives.Overlay
          className="fixed inset-0 bg-black/50 z-10"
          data-testid="dialog-overlay"
        />
        <DialogPrimitives.Content className={contentClasses}>
          <DialogPrimitives.Close
            className="p-2 absolute top-2 right-2"
            data-testid="dialog-close"
          >
            <Icon name="cross" />
          </DialogPrimitives.Close>
          <div className="flex gap-4 max-w-full">
            <div data-testid="dialog-content" className="flex-1">
              <h1 className="text-xl uppercase mb-4" data-testid="dialog-title">
                {t('Select market')}
              </h1>
              <div>{children}</div>
            </div>
          </div>
        </DialogPrimitives.Content>
      </DialogPrimitives.Portal>
    </DialogPrimitives.Root>
  );
};
