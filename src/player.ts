import { MediaFile, Settings, SettingsStore, StateManager } from './state';
import { PlayerClient } from './player.client';
import { ReadStream } from 'fs';

/**
 * This class represents a single xPressCue device.
 * 
 * Instantiate this class once per device you wish to
 * control. Then, use the `connect()` method to establish
 * a connection. 
 * 
 * ```typescript
 * const player = new Player();
 * 
 * player.connect('192.168.2.21').then(() => {
 *   player.identify();
 * });
 * ```
 */
export class Player {

  private readonly _client = new PlayerClient();
  private readonly _state = new StateManager(this._client);

  /** Starts playback */
  play(): void {
    this.client.emit(`playback:play`);
  }

  /** Pauses playback */
  pause(): void {
    this.client.emit(`playback:pause`);
  }

  /** Stops playback */
  stop(): void {
    this.client.emit(`playback:stop`);
  }

  /** Toggles between play and pause */
  togglePlayPause(): void {
    this.client.emit(`playback:togglePlayPause`);
  }

  /** Sets the "next" media by its @param mediaId */
  setNextMedia(mediaId: string): void {
    this.client.emit('playback:set-next', { _id: mediaId });
  }

  /** 
   * Take to the "next" media
   * @param withoutPlay Indicates wether playback should start automatically
   * after a successful take. 
   */
  take(withoutPlay = false): void {
    this.client.emit(withoutPlay ? 'playback:take-next-without-play' : 'playback:take-next');
  } 
  
  /**
   * Loads a playlist in the Live Queue by its @param playlistId
   * @param mode Specifies wether the playlist should be appended
   * or should replace the Live Queue contents.
   */
  loadPlaylist(playlistId: string, mode: 'replace' | 'append'): Promise<void> {
    return this.client.post(`queue/${mode}-playlist`, { _id: playlistId })
  }

  /**
   * Jumps ahead or behind the current playback position
   * @param miliseconds The jump distnace
   * @param from The jump relative position
   */
  jump(miliseconds: number, from: 'current' | 'start' | 'end'): void {
    this.client.emit('playback:jump', { from, miliseconds });
  }

  /** Skips one frame ahead. This will automatically pause playback. */
  nextFrame(): void {
    this.client.emit('playback:nextFrame');
  }
  
  /** Moves to the previous item up the Live Queue */
  queueUp(): void {
    this.queueSkip(-1);
  }

  /** Moves to the next item down the Live Queue */
  queueDown(): void {
    this.queueSkip(1);
  }

  /** Skips a given @param distance in the Live Queue (accepts negative values) */
  queueSkip(distance: number): void {
    this.client.emit('playback:skip', { distance });
  }

  /** Goes to a specific @param queueItemId in the Live Queue */
  queueGoto(queueItemId: string): void {
    this.client.emit('playback:goto', { _id: queueItemId });
  }

  /** Clears the Live Queue */
  queueClear(): Promise<void> {
    return this.client.delete('queue/all');
  }

  /**
   * Activate the "Identify" mode on the device.
   * This will make all LEDs on the front panel of the 
   * device to blink white for a few seconds.
   * */
  identify(): Promise<void> {
    return this.client.post('device/info/identify', '');
  }

  /**
   * Updates the device settings with a 
   * partial settings object.
   * 
   * Useful for setting multiple properties
   * at once.
   * */
  updateSettings(partial: Partial<Settings>): Promise<Settings>
  /** 
   * Updates a single device settings key.
   */
  updateSettings<K extends keyof Settings>(key: K, value: Settings[K]): Promise<Settings>
  updateSettings<K extends keyof Settings>(keyOrPartial: K | Partial<Settings>, value?: Settings[K]): Promise<Settings> {
    if (typeof keyOrPartial === 'string') {
      keyOrPartial = { [keyOrPartial]: value };
    }
    return this.state.getStore(SettingsStore).updatePartial(keyOrPartial);
  }

  /**
   * Uploads a single Media File
   * @param file Readable Stream pointing to the file to upload
   * @param parentFolderId Optional Folder ID to place the uploaded file into,
   * or `_root` to upload it at the root of the device.
   * 
   * Usage:
   * 
   * ```typescript
   * const file = fs.createReadStream('content/my_file.mp4');
   * const media = await player.uploadMedia(file);
   * console.log(media); // => { _id: '', name: '', ... }
   * ```
   */
  uploadMedia(file: ReadStream, parentFolderId?: string): Promise<MediaFile>;
  /**
   * Uploads multiple new Media File
   * @param files Array of Readable Stream pointing to the files to upload
   * @param parentFolderId Optional Folder ID to place the uploaded files into,
   * or `_root` to upload them at the root of the device.
   * 
   * Usage:
   * 
   * ```typescript
   * const file1 = fs.createReadStream('content/my_file.mp4');
   * const file2 = fs.createReadStream('content/other_file.wav');
   * const medias = await player.uploadMedia([ file1, file2 ]);
   * console.log(medias); // => [{ _id: '', name: '', ... }, ...]
   * ```
   */
  uploadMedia(files: ReadStream[], parentFolderId?: string): Promise<MediaFile[]>;
  async uploadMedia(fileOrFiles: ReadStream | ReadStream[], parentFolderId = '_root'): Promise<MediaFile | MediaFile[]> {
    const multi = Array.isArray(fileOrFiles);
    const files = multi ? fileOrFiles : [ fileOrFiles ];
    const response = await this.client.uploadFiles<any, MediaFile[]>('media', files, { parentFolderId });
    return multi ? response : response[0];
  }

  /** Connect to a xPressCue
   * @param host The IP address of the device
   * @param port The port the webservices are running on (default: `80`)
   * @returns a `Promise` that resolves when the connection is successful
   */
  connect(host: string, port = 80): Promise<void> {
    return this.client.connect({ host, port });
  }

  /** Close the connection to a xPressCue  */
  disconnect(): void {
    this.client.disconnect();
  }

  /** Disconnects from the device and remove all event listeners */
  destroy(): void {
    this._client.disconnect();
    this._state.destroy();
  }

  /**
   * Returns the underlying `PlayerClient` instance.
   * 
   * Can be used to subscribe to specific events emitted
   * by the device:
   * 
   * ```typescript
   *  const player = new Player();
   *  player.client.fromEvent('event:state').subscribe(state => {
   *    console.log(state);
   *  });
   *  
   * ```
   * Or to send specific requests to the API:
   * 
   * ```typescript
   *  // Will send a HTTP GET request to `http://HOST/api/device/info`
   *  const deviceInfo = await player.client.get('device/info');
   *  console.log(deviceInfo);
   * ```
   * 
   * */
  get client(): PlayerClient {
    return this._client;
  }

  /**
   * Returns the underlying `StateManager` instance.
   * 
   * The `StateManager` maintains a local state that mirrors
   * the current state of the connected device, and allows
   * you to subscribe to its value changes as a stream.
   * 
   * ```typescript
   * const player = new Player();
   * 
   * player.state.select('MediaFile').subscribe(medias => {
   *  // Will execute everytime there is a change in the `MediaFile` module
   *  console.log(`There are ${medias.length} files on this device.`);
   * });
   * 
   * player.connect('192.168.2.21').then(() => {
   *   const settings = player.state.get('Settings');
   *   // Will print the current settings
   *   console.log(settings);
   * });
   * ```
   * 
   * It also exposes more advanced methods that are specific to
   * certain modules:
   * 
   * ```typescript
   * import { SettingsStore } from '@theatrixx/xpresscue-connect';
   * 
   * // Initialize `Player` and connect to the instance here.
   * 
   * const settingsStore = player.state.getStore(SettingsStore);
   * settingsStore.toFactoryDefault();
   * ```
   * */
  get state(): StateManager {
    return this._state;
  }

}
