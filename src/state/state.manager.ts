import { PlayerClient } from '../player.client';
import { Observable } from 'rxjs';
import { Store } from './state.types';
import { Type } from '../player.models';

import {
  MediaFileStore,
  DeviceStateStore,
  PlaylistStore
} from './stores';

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

  private stores = new Map<string, Store>();
  
  constructor(
    private readonly client: PlayerClient) {
      this.initialize(ALL_STORES);
  }

  async refresh(storeName: string): Promise<void> {
    if (this.stores.has(storeName)) {
      const store = this.stores.get(storeName) as Store<any>;
      await store.refresh();
    }
  }

  set<T>(storeName: string, value: T): void {
    if (this.stores.has(storeName)) {
      const store = this.stores.get(storeName) as Store<any>;
      store.set(value);
    }
  }

  get<T>(name: string): T
  get<T>(type: Type<Store<T>>): T
  get<T, K extends keyof T>(type: Type<Store<T>>, key: K): T[K]
  get<T, K extends keyof T>(nameOrType: string | Type<Store<T>>, key?: K): T | T[K] {
    if (typeof nameOrType !== 'string') {
      nameOrType = this.getStoreNameByType(nameOrType);
    }
    if (!this.stores.has(nameOrType)) {
      throw Error(`Store '${nameOrType}' does not exist!`);
    }
    const store = this.stores.get(nameOrType) as Store<any>;
    return store.get(key);
  }

  select<T>(name: string): Observable<T>
  select<T>(type: Type<Store<T>>): Observable<T>
  select<T, K extends keyof T>(type: Type<Store<T>>, key: K): Observable<T[K]>
  select<T, K extends keyof T>(nameOrType: string | Type<Store<T>>, key?: K): Observable<T | T[K]> {
    if (typeof nameOrType !== 'string') {
      nameOrType = this.getStoreNameByType(nameOrType);
    }
    if (!this.stores.has(nameOrType)) {
      throw Error(`Store '${nameOrType}' does not exist!`);
    }
    const store = this.stores.get(nameOrType) as Store<any>;
    return store.select(key);
  }

  /** Force all stores to refresh their state */
  async refreshAll(): Promise<void> {
    for (const store of this.stores.values()) {
      await store.refresh();
    }
  }

  /** Force all stores to reset to their initial value */
  resetAll(): void {
    for (const store of this.stores.values()) {
      store.reset();
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
    this.client.fromEvent('connect').subscribe(() => this.refreshAll());
    this.client.fromEvent('event:state').subscribe(evt => this.set(evt.name, evt.state));
    this.client.fromEvent('event:reset').subscribe(evt => this.set(evt.name, evt.state));
    this.client.fromEvent('event:entity').subscribe(evt => this.refresh(evt.name));
  }

  private getStoreNameByType<T extends Store>(type: Type<T>): string {
    return (type as any)['storeName'];
  }
}
