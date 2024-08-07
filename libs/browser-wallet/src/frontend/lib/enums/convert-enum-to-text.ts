import {
  AccountType,
  AccountTypeNumber,
  MarginMode,
  MarginModeNumber,
  OrderStatus,
  OrderStatusNumber,
  OrderTimeInForce,
  OrderTimeInForceNumber,
  OrderType,
  OrderTypeNumber,
  PeggedReference,
  PeggedReferenceNumber,
  Side,
  SideNumber,
  StopOrderExpiryStrategy,
  StopOrderExpiryStrategyNumber,
  UndelegateSubmissionMethod,
  UndelegateSubmissionMethodNumber,
  VoteValue,
  VoteValueNumber,
} from '@vegaprotocol/enums';

function getEnumString<T, S>(map: T, numberMap: S) {
  return (index: keyof T | number) => {
    if (!Number.isNaN(Number(index))) {
      for (const key in numberMap) {
        if (numberMap[key] === index) {
          // They keys here overlap completely between number and string enums
          return map[key as unknown as keyof T];
        }
      }
    }
    // They keys here overlap completely between number and string enums
    return map[index as unknown as keyof T];
  };
}

export const processMarginMode = getEnumString(MarginMode, MarginModeNumber);
export const processExpiryStrategy = getEnumString(
  StopOrderExpiryStrategy,
  StopOrderExpiryStrategyNumber
);
export const processUndelegateMethod = getEnumString(
  UndelegateSubmissionMethod,
  UndelegateSubmissionMethodNumber
);
export const processOrderStatus = getEnumString(OrderStatus, OrderStatusNumber);
export const processOrderType = getEnumString(OrderType, OrderTypeNumber);
export const processTimeInForce = getEnumString(
  OrderTimeInForce,
  OrderTimeInForceNumber
);
export const processPeggedReference = getEnumString(
  PeggedReference,
  PeggedReferenceNumber
);
export const processSide = getEnumString(Side, SideNumber);
export const processAccountType = getEnumString(AccountType, AccountTypeNumber);
export const processVoteValue = getEnumString(VoteValue, VoteValueNumber);
