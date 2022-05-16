import { VideoResolution } from '../../player.models';
import { PlayerClient } from '../../player.client';
import { Store, StoreConfig } from '../state.utils';

export interface IoState {
  dmx: boolean | null,
  genLock: VideoResolution | null
}

function createInitialIoState(): IoState {
  return {
    dmx: null,
    genLock: null
  };
}

@StoreConfig({ name: 'IoState', api: 'device/io' })
export class IoStateStore extends Store<IoState> {

  constructor(
    protected readonly client: PlayerClient) {
      super(createInitialIoState(), client);
  }
}
