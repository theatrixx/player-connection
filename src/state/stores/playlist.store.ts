import { PlayerClient } from '../../player.client';
import { SimpleEntity } from '../../player.models';
import { Store, StoreConfig } from '../state.utils';

export interface Playlist extends SimpleEntity {}

@StoreConfig({ name: 'Playlist', api: 'playlists' })
export class PlaylistStore extends Store<Playlist[]> {

  constructor(
    protected readonly client: PlayerClient) {
      super([], client);
  }
}
