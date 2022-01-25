import { PlayerClient } from '../player.client';
import { Observable, Subject } from 'rxjs';
import { Store, STORE_NAME } from './state.types';
import { Type } from '../player.models';

import {
  MediaFileStore,
  DeviceStateStore,
  PlaylistStore
} from './stores';
import { takeUntil } from 'rxjs/operators';

const ALL_STORES: Type<Store>[] = [
  MediaFileStore,
  DeviceStateStore,
  PlaylistStore
];

/**
 * Container that holds all `Store` instances and handles
 * updating them as needed. Can be used to read current state
 * values or subscribing to a stream of value changes.
 */
export class StateManager {

  private readonly stores = new Map<string, Store>();
  private readonly destroy$ = new Subject<void>();
  
  constructor(
    private readonly client: PlayerClient) {
      this.initialize(ALL_STORES);
  }

  /** Force all stores to refresh their state */
  async refresh(): Promise<void>
  /** Force `storeName` to refresh its state */
  async refresh(storeName: string): Promise<void>
  async refresh(storeName?: string): Promise<void> {
    if (storeName) {
      const store = this.getStore(storeName);
      await store.refresh();
    } else {
      for (const store of this.stores.values()) {
        await store.refresh();
      }
    }
  }

  /** Force all stores to reset to their initial value */
  reset(): void {
    for (const store of this.stores.values()) {
      store.reset();
    }
  }

  /** Gets a store by is `name` */
  getStore<S extends Store>(name: string): S
  /** Gets a store by its `type` */
  getStore<S extends Store>(type: Type<S>): S
  getStore<S extends Store>(nameOrType: string | Type<S>): S
  getStore<S extends Store>(nameOrType: string | Type<S>): S {
    if (typeof nameOrType !== 'string') {
      nameOrType = this.getStoreNameByType(nameOrType);
    }
    if (!this.stores.has(nameOrType)) {
      throw Error(`Store '${nameOrType}' does not exist!`);
    }
    return this.stores.get(nameOrType) as S;
  }

  /** Gets the current value of store `name` */
  get<T>(name: string): T
  /** Gets the current value of store `type` */
  get<T>(type: Type<Store<T>>): T
  /** Gets the current  */
  get<T, K extends keyof T>(type: Type<Store<T>>, key: K): T[K]
  get<T, K extends keyof T>(nameOrType: string | Type<Store<T>>, key?: K): T | T[K] {
    const store = this.getStore(nameOrType);
    return store.get(key);
  }

  select<T>(name: string): Observable<T>
  select<T>(type: Type<Store<T>>): Observable<T>
  select<T, K extends keyof T>(type: Type<Store<T>>, key: K): Observable<T[K]>
  select<T, K extends keyof T>(nameOrType: string | Type<Store<T>>, key?: K): Observable<T | T[K]> {
    const store = this.getStore(nameOrType);
    return store.select(key);
  }

  /** Destroys the state; resets all stores and clean up all subscriptions */
  destroy(): void {
    this.reset();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private set<T>(storeName: string, value: T): void {
    if (this.stores.has(storeName)) {
      const store = this.stores.get(storeName) as Store<any>;
      store.set(value);
    }
  }

  private async initialize(types: Type<Store>[]): Promise<void> {
    /** Create store instances */
    for (const type of types) {
      const instance = new type(this.client);
      /** Save to internal repository */
      this.stores.set(this.getStoreNameByType(type), instance);
    }

    /** Subscribe to events */
    this.subscribeEvents();
  }

  private subscribeEvents(): void {
    this.client.fromEvent('connect').pipe(takeUntil(this.destroy$)).subscribe(() => this.refresh());
    this.client.fromEvent('event:state').pipe(takeUntil(this.destroy$)).subscribe(evt => this.set(evt.name, evt.state));
    this.client.fromEvent('event:reset').pipe(takeUntil(this.destroy$)).subscribe(evt => this.set(evt.name, evt.state));
    this.client.fromEvent('event:entity').pipe(takeUntil(this.destroy$)).subscribe(evt => this.refresh(evt.name));
  }

  private getStoreNameByType<T extends Store>(type: Type<T>): string {
    return (type as any)[STORE_NAME];
  }
}
