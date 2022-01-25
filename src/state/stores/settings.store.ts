import { PlayerClient } from '../../player.client';
import { Store, StoreName } from '../state.types';

export interface Settings {
  masterIntensity: number;
  masterVolume: number;
  dmxAddress: number;
  dmxSacnUniverse: number;
  dmxSacnEnable: boolean;
  dmxArtnetUniverse: number;
  dmxArtnetSubnet: number;
  dmxArtnetEnable: boolean;
  fadeOut: number;
  playMode: 'direct' | 'abpreset' | 'playlist';
  loopQueue: boolean;
  outputResolution: string;
  videoOutputMode: 'normal' | 'test' | 'identity' | 'blackout';
  identityOptionBox: boolean,
  identityOptionTone: boolean,
  audioOutputMode: 'stereo' | 'mono' | 'doubleLeft' | 'doubleRight';
  outputColorDepth: 'default' | '24' | '30' | '36';
  outputColorMode: 'default' | 'YUV420' | 'YUV422' | 'YUV444' | 'RGB444';
  outputHDRMode: 'sdr' | 'hdr';
  outputFullRange: boolean;
  outputRoiX: number;
  outputRoiY: number;
  outputRoiW: number;
  outputRoiH: number;
  outputRed: number;
  outputGreen: number;
  outputBlue: number;
  outputSaturation: number;
  keepAspectRatio: boolean;
  outputRoiEnable: boolean;
  isFollower: boolean;
  remoteMasterId: null | string;
  linkHardwareUiPages: boolean;
  testPattern: string;
  resumeOnStart: boolean;
  localLang: string;
}

function createInitialSettings(): Settings {
  return {
    dmxAddress: 1,
    dmxSacnUniverse: 1,
    dmxSacnEnable: false,
    dmxArtnetUniverse: 0,
    dmxArtnetSubnet: 0,
    dmxArtnetEnable: false,
    fadeOut: 0,
    loopQueue: false,
    masterIntensity: 100,
    masterVolume: 100,
    outputResolution: '1920x1080P60',
    playMode: 'playlist',
    videoOutputMode: 'normal',
    identityOptionBox: true,
    identityOptionTone: true,
    audioOutputMode: 'stereo',
    outputColorDepth: 'default',
    outputColorMode: 'default',
    outputHDRMode: 'sdr',
    outputFullRange: true,
    testPattern: '',
    outputRoiEnable: false,
    outputRoiX: 0,
    outputRoiY: 0,
    outputRoiW: 0,
    outputRoiH: 0,
    outputRed: 0,
    outputGreen: 0,
    outputBlue: 0,
    outputSaturation: 0,
    keepAspectRatio: true,
    isFollower: false,
    remoteMasterId: null,
    linkHardwareUiPages: false,
    resumeOnStart: false,
    localLang: 'en',
  };
}

@StoreName('Settings')
export class SettingsStore extends Store<Settings> {

  private api = 'settings';

  constructor(
    private readonly client: PlayerClient) {
      super(createInitialSettings());
  }

  async refresh(): Promise<Settings> {
    const state = await this.client.get<Settings>(this.api);
    return this.set(state);
  }

  async updatePartial(partial: Partial<Settings>): Promise<Settings> {
    return this.client.put(this.api, { ...this.get(), ...partial });
  }

  async toFactoryDefaults(): Promise<Settings> {
    return this.client.delete(this.api);
  }

  async reboot(): Promise<void> {
    return this.client.post(`${this.api}/reboot`, {});
  }
}
