import type { ReactNode } from 'react';
import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import * as DialogPrimitives from '@radix-ui/react-dialog';
import { gql, useQuery } from '@apollo/client';
import classNames from 'classnames';
import type { DealTicketQuery_market } from './';
import {
  ButtonLink,
  Icon,
  Input,
  Loader,
  Splash,
} from '@vegaprotocol/ui-toolkit';
import {
  t,
  useScreenDimensions,
  useOutsideClick,
} from '@vegaprotocol/react-helpers';
import type {
  MarketNames,
  MarketNames_markets,
} from './__generated__/MarketNames';
import { IconNames } from '@blueprintjs/icons';
import { MarketState } from '@vegaprotocol/types';
import _ from 'lodash';

export const MARKET_NAMES_QUERY = gql`
  query MarketNames {
    markets {
      id
      state
      tradableInstrument {
        instrument {
          code
          name
          metadata {
            tags
          }
          product {
            ... on Future {
              quoteName
            }
          }
        }
      }
    }
  }
`;

interface Props {
  market: DealTicketQuery_market;
  setMarket: (marketId: string) => void;
  ItemRenderer?: React.FC<{ market: MarketNames_markets; isMobile?: boolean }>;
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const MarketSelector = ({ market, setMarket, ItemRenderer }: Props) => {
  const { isMobile } = useScreenDimensions();
  const contRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const arrowButtonRef = useRef<HTMLButtonElement | null>(null);
  const [skip, setSkip] = useState(true);
  const [results, setResults] = useState<MarketNames_markets[]>([]);
  const [showPane, setShowPane] = useState(false);
  const [lookup, setLookup] = useState(
    market.tradableInstrument.instrument.name || ''
  );
  const [dialogContent, setDialogContent] = useState<React.ReactNode | null>(
    null
  );

  const { data, loading, error } = useQuery<MarketNames>(MARKET_NAMES_QUERY, {
    skip,
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
      if (value) {
        setSkip(false);
      }
    },
    [setLookup, setShowPane, setSkip]
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
    (
      event: React.KeyboardEvent,
      market: MarketNames_markets,
      index: number
    ) => {
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
    setSkip(false);
    inputRef.current?.focus();
  }, [showPane, setShowPane, setSkip, inputRef]);

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
            className="h-[30px] w-[calc(100%-20px)] border-none"
            ref={inputRef}
            tabIndex={0}
            value={lookup}
            placeholder={t('Search')}
            onChange={handleOnChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleOnBlur}
          />
          <span className="absolute self-end top-[7px] right-0 z-10">
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
        <hr className="mb-5" />
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
      data?.markets?.filter(
        (item: MarketNames_markets) =>
          item.state === MarketState.STATE_ACTIVE &&
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
