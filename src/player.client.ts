import { Observable, BehaviorSubject, Subject } from 'rxjs';
import axios from 'axios';
import { connect } from 'socket.io-client';
import FormData from 'form-data';
import { ReadStream } from 'fs';

import { ConnectionState } from './player.models';
import { SocketEvents } from './player.models';

/**
 * Low-level HTTP (axios) and Socket.IO wrapper for communicating
 * with the xPressCue over web services.
 */
export class PlayerClient {

  private subjects: Record<string, Subject<any>> = {};
  
  private connectionState$ = new BehaviorSubject<ConnectionState>(ConnectionState.ERROR);
  private config$ = new BehaviorSubject<ClientConfig>(createDefaultConfig());

  private socket: SocketIOClient.Socket | undefined;
  private http = axios.create();

  connect(config?: ClientConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        reject('Already connected! Disconnect first.');
      }
  
      if (config) {
        this.config$.next(config);
      }
      
      const onConnect = () => {
        this.connectionState$.next(ConnectionState.OK);
        resolve();
      }
  
      this.socket = connect(this.baseURL);
      this.socket.on('connect', () => onConnect());
      this.socket.on('disconnect', () => this.connectionState$.next(ConnectionState.ERROR));
  
      for (const [ eventName, subject ] of Object.entries(this.subjects)) {
        this.socket.on(eventName, (evt: unknown) => subject.next(evt));
      }
    });
  }

  disconnect(): void {
    if (this.connected && this.socket) {
      this.socket.disconnect();
      this.socket.removeAllListeners();
      this.socket = undefined;
    } 
  }

  fromEvent<K extends keyof SocketEvents>(eventName: K): Observable<SocketEvents[K]> {
    if (!this.subjects[eventName]) {
      this.subjects[eventName] = new Subject<SocketEvents[K]>();
    }
    return this.subjects[eventName].asObservable();
  }

  emit<D>(subject: string, data?: D): void {
    if (this.connected && this.socket) {
      this.socket.emit(subject, data);
    }
  }

  async get<R>(url: string): Promise<R> {
    const req = await this.http.get(url, { baseURL: this.api });
    return req.data;
  }

  async post<D, R>(url: string, data: D): Promise<R> {
    const req = await this.http.post(url, data, { baseURL: this.api });
    return req.data;
  }

  async put<D, R>(url: string, data: D): Promise<R> {
    const req = await this.http.put(url, data, { baseURL: this.api });
    return req.data;
  }

  async patch<D, R>(url: string, data: D): Promise<R> {
    const req = await this.http.patch(url, data, { baseURL: this.api });
    return req.data;
  }

  async delete<R>(url: string): Promise<R> {
    const req = await this.http.delete(url, { baseURL: this.api });
    return req.data;
  }

  async uploadFiles<D, R>(url: string, files: ReadStream[], data?: D): Promise<R> {
    const formData = new FormData();

    for (const file of files) {
      formData.append('files', file);
    }

    if (data) {
      formDataFieldsFromObject(data).forEach(([ key, value ]) => formData.append(key, value));
    }
    
    const req = await this.http.post(url, formData, {
      baseURL: this.api,
      headers: formData.getHeaders()
    });

    return req.data;
  }

  get connectionStateChanges(): Observable<ConnectionState> {
    return this.connectionState$.asObservable();
  }

  get connectionState(): ConnectionState {
    return this.connectionState$.getValue();
  }

  get connected(): boolean {
    return this.connectionState === ConnectionState.OK;
  }

  get configChanges(): Observable<ClientConfig | undefined> {
    return this.config$.asObservable();
  }

  get config(): ClientConfig {
    return this.config$.getValue();
  }

  get baseURL(): string {
    return `http://${this.config.host}:${this.config.port}`
  }

  get api(): string {
    return `${this.baseURL}/api/`;
  }
}

export interface ClientConfig {
  /** The host (IP address of the remote player) */
  host: string;
  /** The port (usually `80`) the webserver on the remote device is bound to. */
  port: number;
}

function createDefaultConfig(): ClientConfig {
  return {
    host: '127.0.0.1',
    port: 80
  };
}

function formDataFieldsFromObject<T extends Record<string, any>>(obj: T): [ string, any ][] {
  const dataEntries = Object.entries(obj);
  return dataEntries.map(([ key, value ]) => (
    [
      key,
      typeof value === 'string' ? value : JSON.stringify(value)
    ]
  ));
}
