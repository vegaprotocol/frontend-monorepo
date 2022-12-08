import type * as Schema from '@vegaprotocol/types';

type Event = {
  __typename?: string;
};

type BusEvent<T extends Event> = {
  event?: T | Event;
};

export function getEvents<T extends Event>(
  eventType: Schema.BusEventType,
  busEvents: BusEvent<T>[]
) {
  return busEvents.reduce<T[]>((acc, item) => {
    if (item.event && item.event.__typename === eventType) {
      acc.push(item.event as T);
    }
    return acc;
  }, []);
}
