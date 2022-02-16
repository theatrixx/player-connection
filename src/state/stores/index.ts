import { Type } from '../../player.models';
import { Store } from '../state.utils';
import { DeviceStateStore } from './device-state.store';

import { MediaFileStore } from './media-file.store';
import { PlaylistStore } from './playlist.store';
import { SettingsStore } from './settings.store';
import { TestPatternStore } from './test-pattern.store';

export * from './media-file.store';
export * from './device-state.store';
export * from './playlist.store';
export * from './settings.store';
export * from './test-pattern.store';

export const ALL_STORES: Type<Store>[] = [
  MediaFileStore,
  DeviceStateStore,
  PlaylistStore,
  SettingsStore,
  TestPatternStore
];
