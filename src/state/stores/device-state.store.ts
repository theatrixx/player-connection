import { PlayerClient } from '../../player.client';
import { Store, StoreName } from '../state.types';

export interface DeviceState {
  playState: 'playing' | 'paused' | 'stopped';
  waitState: 'countdown' | 'manual' | null,
  currentMedia: QueueItem | null;
  nextMedia: QueueItem | null;
  isReady: boolean;
  isBusy: boolean;
  enableFadeOut: boolean;
  progress: {
    elapsed: number;
    remaining: number;
  }
}

export interface QueueItem {
  _id: string;
  mediaId: string;
}

function createInitialDeviceState(): DeviceState {
  return {
    playState: 'stopped',
    currentMedia: null,
    nextMedia: null,
    isBusy: true,
    isReady: false,
    enableFadeOut: false,
    waitState: null,
    progress: {
      elapsed: 0,
      remaining: 0
    }
  }
}

@StoreName('DeviceState')
export class DeviceStateStore extends Store<DeviceState> {

  constructor(
    private readonly client: PlayerClient) {
      super(createInitialDeviceState());
  }

  async refresh(): Promise<DeviceState> {
    const state = await this.client.get<DeviceState>('device/state');
    return this.set(state);
  }
}
