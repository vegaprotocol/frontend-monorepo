import type { MouseEvent } from 'react';
import { useCallback } from 'react';
import get from 'lodash/get';
import { Pill } from '@vegaprotocol/ui-toolkit';
import type { Market } from '@vegaprotocol/types';

const productTypeMap: { [key in string]: string } = {
  Future: 'Futr',
  Spot: 'Spot',
  Perpetual: 'Perp',
};

export const MarketProductPill = ({
  productType,
}: {
  productType?: string;
}) => {
  return productType ? (
    <Pill size="xxs" className="uppercase ml-0.5" title={productType}>
      {productTypeMap[productType] || productType}
    </Pill>
  ) : null;
};

interface MarketNameCellProps {
  value?: string | null;
  data?:
    | { id?: string; marketId?: string; productType?: string; market?: Market }
    | Market;
  idPath?: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  productType?: string;
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
    (data as { productType?: string }).productType ||
    (data as Market)?.tradableInstrument?.instrument.product.__typename ||
    (data as { market: Market })?.market?.tradableInstrument.instrument.product
      .__typename;

  if (!value) return;
  const content = (
    <>
      <span data-testid="market-code" data-market-id={id}>
        {value}
      </span>
      <MarketProductPill productType={productType} />
    </>
  );
  return onMarketClick && id ? (
    <button onClick={handleOnClick} tabIndex={0}>
      {content}
    </button>
  ) : (
    content
  );
};
