import { Observable, BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { Type } from '../player.models';
import { PlayerClient } from '../player.client';

/**
 * This abstract class represents a `Store` holding
 * a certain state of type `T`. 
 * 
 * It is the base class for holding, retrieveing
 * and updating state from the device.
 */
export abstract class Store<T = any> {

  protected state$: BehaviorSubject<T>;

  /**
   * Initializes the store with a `initialState` value.
   */
  constructor(
    protected readonly initialState: T,
    protected readonly client: PlayerClient) {
      this.state$ = new BehaviorSubject<T>(initialState);
  }
  
  /** 
   * Refreshes the store with the latest dataset from the server.
   * */
  async refresh(): Promise<T> {
    const state = await this.client.get<T>(this.api);
    return this.set(state);
  }

  /** Returns the current value of the state. */
  get(): T
  /** Returns the current value of a key of the state. */
  get<K extends keyof T>(key: K | undefined): T[K]
  get<K extends keyof T>(key?: K): T | T[K] {
    const state = this.state$.getValue();
    return !key ? state : state[key];
  }

  /** Returns a stream that will emit whenever the state changes. */
  select(): Observable<T>
  /** Returns a stream that will emit whenever a partical key of the state changes. */
  select<K extends keyof T>(key: K | undefined): Observable<T[K]>
  select<K extends keyof T>(key?: K): Observable<T | T[K]> {
    const state$ = this.state$.asObservable();
    return !key ? state$ : state$.pipe(
      map(val => val[key]),
      distinctUntilChanged((a, b) => isEqual(a, b))
    );
  }

  /** Override the state with a new `value` */
  set(value: T): T {
    this.state$.next(value);
    return value;
  }

  /** Resets the state to its `initialValue`. */
  reset(): void {
    this.set(this.initialState);
  }

  /** Retrieves the metadata stored using the `StoreConfig` decorator */
  protected get config(): StoreConfigMetadata {
    return (this.constructor as any)[STORE_CONFIG];
  }

  protected get name(): string {
    return this.config.name;
  }

  protected get api(): string {
    return this.config.api;
  }
}

/**
 * Decorator that marks a class as `Store` and is used to
 * specify its configuration.
 */
export function StoreConfig(config: StoreConfigMetadata): (constructor: Type<Store>) => void {
  return function(constructor: any) {
    constructor[STORE_CONFIG] = config;
  };
}

export interface StoreConfigMetadata {
  /** The name of the entity managed by this store */
  name: string;
  /** The (relative) path to the REST API resource */
  api: string;
}

export const STORE_CONFIG = 'STORE_CONFIG';
