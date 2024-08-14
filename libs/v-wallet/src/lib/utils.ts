export interface MapLikeStorage {
  set(key: string, value: Record<string, unknown>): Promise<void>;
  get(key: string): Promise<unknown | undefined>;
  clear(): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface SyncMapLikeStorage {
  set(key: string, value: Record<string, unknown>): void;
  get(key: string): unknown | undefined;
  clear(): void;
  delete(key: string): void;
}
