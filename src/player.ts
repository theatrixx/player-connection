import { StateManager } from 'src';
import { PlayerClient } from './player.client';

export class Player {

  private readonly _client = new PlayerClient();
  private readonly _state = new StateManager(this._client);

  play(): void {
    this.client.emit(`playback:play`);
  }

  pause(): void {
    this.client.emit(`playback:pause`);
  }

  stop(): void {
    this.client.emit(`playback:stop`);
  }

  togglePlayPause(): void {
    this.client.emit(`playback:togglePlayPause`);
  }

  setNextMedia(mediaId: string): void {
    this.client.emit('playback:set-next', { _id: mediaId });
  }

  take(withoutPlay = false): void {
    this.client.emit(withoutPlay ? 'playback:take-next-without-play' : 'playback:take-next');
  } 
  
  loadPlaylist(playlistId: string, mode: 'replace' | 'append'): void {
    this.client.post(`queue/${mode}-playlist`, { _id: playlistId })
  }

  jump(miliseconds: number, from: 'current' | 'start' | 'end'): void {
    this.client.emit('playback:jump', { from, miliseconds });
  }

  nextFrame(): void {
    this.client.emit('playback:nextFrame');
  }
  
  queueUp(): void {
    this.queueSkip(-1);
  }

  queueDown(): void {
    this.queueSkip(1);
  }

  queueSkip(distance: number): void {
    this.client.emit('playback:skip', { distance });
  }

  queueGoto(queueItemId: string): void {
    this.client.emit('playback:goto', { _id: queueItemId });
  }

  queueClear(): void {
    this.client.delete('queue/all');
  }

  /** Connect to a MediaPlayer */
  connect(host: string, port = 80): void {
    this.client.connect({ host, port });
  }

  /** Close the connection to a MediaPlayer  */
  disconnect(): void {
    this.client.disconnect();
  }

  /** Returns the underlying `PlayerClient` instance */
  get client(): PlayerClient {
    return this._client;
  }

  /** Returns the underlying `StoreContainer` instance */
  get store(): StateManager {
    return this._state;
  }

}
