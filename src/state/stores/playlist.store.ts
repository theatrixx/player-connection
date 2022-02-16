import { PlayerClient } from '../../player.client';
import { SimpleEntity } from '../../player.models';
import { Store, StoreName } from '../state.utils';

export interface Playlist extends SimpleEntity {}

@StoreName('Playlist')
export class PlaylistStore extends Store<Playlist[]> {

  constructor(
    private readonly client: PlayerClient) {
      super([]);
  }

  async refresh(): Promise<Playlist[]> {
    const state = await this.client.get<Playlist[]>('playlists');
    return this.set(state);
  }
}
