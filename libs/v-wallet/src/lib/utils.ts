export interface MapLikeStorage<T> {
  set(key: string, value: T): Promise<void>;
  get(key: string): Promise<T | undefined>;
  clear(): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface SyncMapLikeStorage<T> {
  set(key: string, value: T): void;
  get(key: string): T | undefined;
  clear(): void;
  delete(key: string): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Transaction = any;
