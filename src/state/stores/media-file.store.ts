import { SimpleEntity } from '../../player.models';
import { PlayerClient } from '../../player.client';
import { Store, StoreConfig } from '../state.utils';

export interface MediaFile extends SimpleEntity {}

@StoreConfig({ name: 'MediaFile', api: 'media' })
export class MediaFileStore extends Store<MediaFile[]> {

  constructor(
    protected readonly client: PlayerClient) {
      super([], client);
  }
}
