import { WithId } from '../../player.models';
import { PlayerClient } from '../../player.client';
import { Store, StoreName } from '../state.types';

export interface TestPattern extends WithId {
  builtIn: boolean;
}

@StoreName('TestPattern')
export class TestPatternStore extends Store<TestPattern[]> {

  constructor(
    private readonly client: PlayerClient) {
      super([]);
  }

  async refresh(): Promise<TestPattern[]> {
    const state = await this.client.get<TestPattern[]>('settings/patterns');
    return this.set(state);
  }
}
