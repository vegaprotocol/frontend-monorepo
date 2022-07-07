import React, { useCallback, useState, useEffect, useRef } from 'react';
import { gql, useQuery } from '@apollo/client';
import classNames from 'classnames';
import type { DealTicketQuery_market } from './__generated__';
import { Button, Input, Loader, Splash } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
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
  ItemRenderer?: React.FC<{ market: MarketNames_markets }>;
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const MarketSelector = ({ market, setMarket, ItemRenderer }: Props) => {
  const contRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [skip, setSkip] = useState(true);
  const [results, setResults] = useState<MarketNames_markets[]>([]);
  const [showPane, setShowPane] = useState(false);
  const [lookup, setLookup] = useState(market.name || '');
  const { data, loading, error } = useQuery<MarketNames>(MARKET_NAMES_QUERY, {
    skip,
  });

  const handleOnChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const {
        target: { value },
      } = event;
      setLookup(value);
      setShowPane(!!value);
      if (value) {
        setSkip(false);
      }
    },
    [setLookup, setShowPane, setSkip]
  );

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
        (contRef.current?.children[0] as HTMLDivElement).focus();
      }
    },
    [contRef]
  );

  const handleOnBlur = useCallback(() => {
    if (!lookup) {
      setLookup(market.name);
    }
  }, [market, lookup, setLookup]);

  const openPane = useCallback(() => {
    setShowPane(!showPane);
    setSkip(false);
    inputRef.current?.focus();
  }, [showPane, setShowPane, setSkip, inputRef]);

  return (
    <div className="md:relative flex">
      <div className="relative w-full">
        <Input
          className="h-[30px] w-full"
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
          appendIconName={IconNames.ARROW_DOWN}
          onClick={openPane}
        />
      </div>
      <div
        className={classNames(
          'absolute flex flex-col top-[30px] z-10 drop-shadow-md border-1 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white min-w-full min-h-fit md:max-h-[200px] overflow-y-auto',
          showPane ? 'block' : 'hidden'
        )}
      >
        {loading && <Loader />}
        {error && (
          <Splash>{t(`Something went wrong: ${error.message}`)}</Splash>
        )}
        <Button
          className="block md:hidden self-end"
          appendIconName="cross"
          variant="inline-link"
          onClick={() => setShowPane(false)}
        />
        <div ref={contRef} className="w-full">
          {results.map((market, i) => (
            <div
              role="button"
              tabIndex={0}
              key={market.id}
              className="cursor-pointer focus:bg-white-95 focus:outline-0 dark:focus:bg-black-80 px-20 py-5"
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
};
