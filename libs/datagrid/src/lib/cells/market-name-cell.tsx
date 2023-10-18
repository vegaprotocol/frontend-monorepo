import type { MouseEvent } from 'react';
import { useCallback } from 'react';
import get from 'lodash/get';
import { Pill } from '@vegaprotocol/ui-toolkit';
import {
  ProductTypeShortName,
  type Market,
  type ProductType,
  ProductTypeMapping,
} from '@vegaprotocol/types';

export const MarketProductPill = ({
  productType,
}: {
  productType?: ProductType;
}) => {
  if (!productType) {
    return null;
  }
  return (
    <Pill
      size="xxs"
      className="uppercase ml-0.5"
      title={ProductTypeMapping[productType]}
    >
      {ProductTypeShortName[productType]}
    </Pill>
  );
};

interface MarketNameCellProps {
  value?: string | null;
  data?:
    | { id?: string; marketId?: string; productType?: string; market?: Market }
    | Market;
  idPath?: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  productType?: ProductType;
}

export const MarketNameCell = ({
  value,
  data,
  idPath,
  onMarketClick,
  productType,
}: MarketNameCellProps) => {
  const id = data ? get(data, idPath ?? 'id', 'all') : '';
  const handleOnClick = useCallback(
    (ev: MouseEvent<HTMLButtonElement>) => {
      ev.preventDefault();
      ev.stopPropagation();
      id && onMarketClick?.(id, ev.metaKey || ev.ctrlKey);
    },
    [id, onMarketClick]
  );

  productType =
    productType ||
    (data as { productType?: ProductType }).productType ||
    (data as Market)?.tradableInstrument?.instrument.product.__typename ||
    (data as { market: Market })?.market?.tradableInstrument.instrument.product
      .__typename;

  if (!value) return null;
  const content = (
    <>
      <span data-testid="market-code" data-market-id={id}>
        {value}
      </span>
      {productType && <MarketProductPill productType={productType} />}
    </>
  );
  return onMarketClick && id ? (
    <button
      onClick={handleOnClick}
      tabIndex={0}
      className="block w-full overflow-hidden text-left text-ellipsis whitespace-nowrap"
    >
      {content}
    </button>
  ) : (
    content
  );
};
