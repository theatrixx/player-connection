import { WithId } from '../../player.models';
import { PlayerClient } from '../../player.client';
import { Store, StoreConfig } from '../state.utils';

export interface TestPattern extends WithId {
  builtIn: boolean;
}

@StoreConfig({ name: 'TestPattern', api: 'settings/patterns' })
export class TestPatternStore extends Store<TestPattern[]> {

  constructor(
    protected readonly client: PlayerClient) {
      super([], client);
  }
}
