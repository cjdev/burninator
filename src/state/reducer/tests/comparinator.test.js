import { reducer } from '../comparinator';
import * as Actions from '../../actions';

const state = {};

describe('comparinator', () => {
  test('exists', () => {
    expect(reducer).not.toBeNull();
  });

  test('should handle getCompareVersionRequest', () => {
    const { loading, error } = reducer(state, Actions.getCompareVersionsRequest());
    expect(loading).toBe(true);
    expect(error).toBeNull();
  });
});
