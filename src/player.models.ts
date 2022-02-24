export enum ConnectionState {
  OK = 0,
  WARNING = 1,
  ERROR = 2
}

export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}

export interface StateUpdate<T = any> {
  name: string;
  state: T;
}

export type EntityEventType = 'create' | 'update' | 'delete';
export type EntityEvent<T = any> = EntityEventSingle<T> | EntityEventMulti<T>;
interface BaseEntityEvent {
    name: string;
    type: EntityEventType;
    multi: boolean;
}
export interface EntityEventSingle<T> extends BaseEntityEvent {
    multi: false;
    id: string;
    entity: T;
}
export interface EntityEventMulti<T> extends BaseEntityEvent {
    multi: true;
    id: string[];
    entity: T[];
}

export interface WithId {
  _id: string;
}

export interface SimpleEntity extends WithId {
  name: string;
}

export interface SocketEvents {
  /** Emitted whenever a single-state value is altered (i.e. Settings) */
  'event:state': StateUpdate;
  /** Emitted whenever a multi-entity list is altered (i.e. MediaFile) */
  'event:entity': EntityEvent;
  /** Emitted whenever any value (single-state or multi-entity) needs to be reset with a new value */
  'event:reset': StateUpdate;
  /** Emited whenever the client successfully connects to a xPressCue device */
  'connect': void;
  /** Emitted whenever the client is disconnected from a xPressCue device */
  'disconnect': void;
}
