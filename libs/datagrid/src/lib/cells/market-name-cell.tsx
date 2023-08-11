import type { MouseEvent } from 'react';
import { useCallback } from 'react';
import get from 'lodash/get';
import { Pill } from '@vegaprotocol/ui-toolkit';
import type { Market } from '@vegaprotocol/types';
import { CenteredGridCellWrapper } from './centered-grid-cell';

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
    <Pill size="xxs" className="uppercase ml-0.5">
      {productTypeMap[productType] || productType}
    </Pill>
  ) : null;
};

interface MarketNameCellProps {
  value?: string | null;
  data?: { id?: string; marketId?: string; market?: Market };
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
    data?.market?.tradableInstrument.instrument.product.__typename;
  if (!value) return;
  const content = (
    <>
      {value}
      <MarketProductPill productType={productType} />
    </>
  );
  return (
    <CenteredGridCellWrapper className="h-[30px]">
      {onMarketClick && id ? (
        <button onClick={handleOnClick} tabIndex={0}>
          {content}
        </button>
      ) : (
        content
      )}
    </CenteredGridCellWrapper>
  );
};
