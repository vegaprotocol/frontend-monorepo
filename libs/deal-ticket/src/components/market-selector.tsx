import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import { gql, useQuery } from '@apollo/client';
import classNames from 'classnames';
import type { DealTicketQuery_market } from './__generated__';
import {
  Button,
  Dialog,
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

export const MARKET_NAMES_QUERY = gql`
  query MarketNames {
    markets {
      id
      name
      tradableInstrument {
        instrument {
          code
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
  const [lookup, setLookup] = useState(market.name || '');
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
    ({ id, name }) => {
      setLookup(name);
      setShowPane(false);
      setMarket(id);
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
          handleMarketSelect(market);
          break;
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
      setLookup(market.name);
    }
  }, [market, lookup, showPane, setLookup]);

  const openPane = useCallback(() => {
    setShowPane(!showPane);
    setSkip(false);
    inputRef.current?.focus();
  }, [showPane, setShowPane, setSkip, inputRef]);

  const handleDialogOnchange = useCallback(
    (isOpen) => {
      setShowPane(isOpen);
      if (!isOpen) {
        setLookup(lookup || market.name);
        inputRef.current?.focus();
      }
    },
    [setShowPane, lookup, setLookup, market.name, inputRef]
  );

  const selectorContent = useMemo(() => {
    return (
      <div className="relative flex flex-col">
        <div className="relative w-full min-h-[30px] dark:bg-black">
          <Input
            className="h-[30px] w-[calc(100%-20px)] border-none dark:bg-black"
            ref={inputRef}
            tabIndex={0}
            value={lookup}
            placeholder={t('Search')}
            onChange={handleOnChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleOnBlur}
          />
          <Button
            className="absolute self-end top-[7px] right-0 z-10"
            variant="inline-link"
            onClick={openPane}
            ref={arrowButtonRef}
            data-testid="arrow-button"
          >
            <Icon
              name={IconNames.ARROW_DOWN}
              className={classNames('fill-current transition-transform', {
                'rotate-180': showPane,
              })}
              size={16}
            />
          </Button>
        </div>
        <hr className="md:hidden mb-5" />
        <div
          className={classNames(
            'md:absolute z-20 flex flex-col top-[30px] z-10 md:drop-shadow-md md:border-1 md:border-black md:dark:border-white bg-white dark:bg-black text-black dark:text-white min-w-full md:max-h-[200px] overflow-y-auto',
            showPane ? 'block' : 'hidden'
          )}
          data-testid="market-pane"
        >
          {loading && <Loader />}
          {error && (
            <Splash>{t(`Something went wrong: ${error.message}`)}</Splash>
          )}
          <div ref={contRef} className="w-full">
            {results.map((market, i) => (
              <div
                role="button"
                tabIndex={0}
                key={market.id}
                className="bg-white dark:bg-black cursor-pointer focus:bg-white-95 focus:outline-0 dark:focus:bg-black-80 px-20 py-5"
                onClick={() => handleMarketSelect(market)}
                onKeyDown={(e) => handleItemKeyDown(e, market, i)}
              >
                {ItemRenderer ? <ItemRenderer market={market} /> : market.name}
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
      data?.markets?.filter((item: MarketNames_markets) =>
        item.name.match(new RegExp(escapeRegExp(lookup), 'i'))
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
      <Dialog
        titleClassNames="uppercase font-alpha"
        contentClassNames="left-[0px] top-[99px] h-[calc(100%-99px)] border-0 translate-x-[0] translate-y-[0] border-none overflow-y-auto"
        title={t('Select Market')}
        open={Boolean(dialogContent)}
        onChange={handleDialogOnchange}
      >
        {dialogContent}
      </Dialog>
    </>
  );
};
