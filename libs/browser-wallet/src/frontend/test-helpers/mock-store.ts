import type { StoreApi, UseBoundStore } from 'zustand';

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export function mockStore<T>(
  store: UseBoundStore<StoreApi<T>>,
  value: DeepPartial<T>
) {
  (store as unknown as jest.Mock).mockImplementation((function_) =>
    function_(value)
  );
}
