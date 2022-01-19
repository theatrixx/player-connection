import { SimpleEntity } from '../../player.models';
import { PlayerClient } from '../../player.client';
import { Store, StoreName } from '../state.types';

export interface MediaFile extends SimpleEntity {}

@StoreName('MediaFile')
export class MediaFileStore extends Store<MediaFile[]> {

  constructor(
    private readonly client: PlayerClient) {
      super([]);
  }

  async refresh(): Promise<MediaFile[]> {
    const state = await this.client.get<MediaFile[]>('media');
    return this.set(state);
  }
}
