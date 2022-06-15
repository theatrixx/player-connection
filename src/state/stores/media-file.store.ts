import { VideoResolution } from '../../player.models';
import { PlayerClient } from '../../player.client';
import { Store, StoreConfig } from '../state.utils';

export interface MediaFile {
  _id: string;
  remoteId: string;
  name: string;
  extension: string;
  size: number;
  parentFolderId: string;
  locked: boolean;
  comment: string;
  mediaType: 'video' | 'audio' | 'picture';
  duration: number;
  startPoint: number;
  endPoint: number;
  audioVolume: number
  intensity: number;
  thumbnailPoint: number;
  thumbnailAvailable: boolean;
  loop: boolean;
  fadeIn: number;
  fadeOut: number;
  endTransitionMode: 'freeze' | 'fadeOut';
  audioCodec: string;
  videoCodec: string;
  formatName: string;
  webMediaType: string;
  hasRotationMetadata: boolean;
  mimetype: string;
  encoding: string;
  created: Date;
  modified: Date;
  trimmedDuration?: number;
  converted: boolean;
  ready: boolean;
  dmxLsb: number;
  dmxMsb: number;
  red: number;
  blue: number;
  green: number;
  saturation: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  dmxAddress16bit?: number;
  nbFrame: number;
  hdr: boolean;
  audioTrackNumber: number;
  audioTrackSelect: number,
  error: string;
  resolution?: VideoResolution;
}

@StoreConfig({ name: 'MediaFile', api: 'media' })
export class MediaFileStore extends Store<MediaFile[]> {

  constructor(
    protected readonly client: PlayerClient) {
      super([], client);
  }
}
