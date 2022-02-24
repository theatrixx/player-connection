import { PlayerClient } from '../../player.client';
import { Store, StoreConfig } from '../state.utils';

export interface DeviceInfo {
  name: string;
	owner: string;
	model: string;
	serialNumber: string;
	hardwareVersion: string;
	version: string;
  storageStats: StorageStatistics;
}

/** Device storage statistics */
export interface StorageStatistics {
  /** Amount of disk space available on device, in bytes */
  free: number;
  /** Amount of disk space used on device, in bytes */
  used: number;
  /** Amount of disk space used on device, in percentage */
  usedPct: number;
  /** Total amount of disk space on device, in bytes */
  total: number;
  /** Wether the storage approaches the total available space */
  critical: boolean;
}

function createInitialDeviceInfo(): DeviceInfo {
  return {
    version: '',
    hardwareVersion: '',
    model: '',
    name: '',
    owner: '',
    serialNumber: '',
    storageStats: {
      free: 0,
      total: 0,
      used: 0,
      usedPct: 0,
      critical: false
    }
  };
}


@StoreConfig({ name: 'DeviceInfo', api: 'device/info' })
export class DeviceInfoStore extends Store<DeviceInfo> {

  constructor(
    protected readonly client: PlayerClient) {
      super(createInitialDeviceInfo(), client);
  }
}
