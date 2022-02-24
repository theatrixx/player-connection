import { Type } from '../../player.models';
import { Store } from '../state.utils';
import { DeviceInfoStore } from './device-info.store';
import { DeviceStateStore } from './device-state.store';

import { MediaFileStore } from './media-file.store';
import { PlaylistStore } from './playlist.store';
import { SettingsStore } from './settings.store';
import { TestPatternStore } from './test-pattern.store';

export * from './device-info.store';
export * from './device-state.store';
export * from './media-file.store';
export * from './playlist.store';
export * from './settings.store';
export * from './test-pattern.store';

export const ALL_STORES: Type<Store>[] = [
  DeviceInfoStore,
  DeviceStateStore,
  MediaFileStore,
  PlaylistStore,
  SettingsStore,
  TestPatternStore
];
