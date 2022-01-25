import { Observable, BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { Type } from '../player.models';

/**
 * This abstract class represents a `Store` holding
 * a certain state of type `T`. 
 */
export abstract class Store<T = any> {

  protected state$: BehaviorSubject<T>;
  protected initialState: T;

  /**
   * Initializes the store with a `initialState` value.
   */
  constructor(initialState: T) {
    this.initialState = initialState;
    this.state$ = new BehaviorSubject<T>(initialState);
  }
  
  /** 
   * This method should refresh the store with the
   * latest dataset from the server.
   * */
  abstract refresh(): T | Promise<T>;

  /** Returns the current value of the state. */
  get(): T
  /** Returns the current value of a key of the state. */
  get<K extends keyof T>(key?: K): T[K]
  get<K extends keyof T>(key?: K): T | T[K] {
    const state = this.state$.getValue();
    return !key ? state : state[key];
  }

  /** Returns a stream that will emit whenever the state changes. */
  select(): Observable<T>
  /** Returns a stream that will emit whenever a partical key of the state changes. */
  select<K extends keyof T>(key?: K): Observable<T[K]>
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
}

/**
 * Decorator that marks a class as `Store` and is used to
 * indicate its identifying `name`.
 */
export function StoreName(name: string): (constructor: Type<Store>) => void {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  return function(constructor: any) {
    constructor[STORE_NAME] = name;
  };
}

export const STORE_NAME = 'storeName';
