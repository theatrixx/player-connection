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
  'event:state': StateUpdate;
  'event:entity': EntityEvent;
  'event:reset': StateUpdate;
  'connect': void;
  'disconnect': void;
}
