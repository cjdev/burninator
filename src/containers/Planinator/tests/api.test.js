import * as t from '../../../testing/testing-utils';
import { getPlan, putPlan } from '../api';
import { actions } from '../state';

describe('api', () => {
  describe('getPlan', () => {
    it('should dispatch plan', async () => {
      const planId = 1;
      const version = 'current';
      const dispatch = jest.fn();
      const expected = {};

      t.mockFetchWith(t.responseOk(t.jsonResult(expected)));

      await getPlan(planId, version, dispatch);

      expect(dispatch).toHaveBeenCalledWith(actions.getPlanStart());
      expect(dispatch).toHaveBeenCalledWith(actions.getPlanSuccess(expected));
    });

    it('should default to current version', async () => {
      const planId = 1;
      const version = undefined;
      const dispatch = jest.fn();

      t.mockFetchWith(t.responseOk(t.jsonResult({})));

      await getPlan(planId, version, dispatch);

      expect(global.fetch).toHaveBeenCalledWith('/api/planinator/1/current');
    });

    it('should dispatch error', async () => {
      const planId = 1;
      const version = 'current';
      const dispatch = jest.fn();
      const expectedErrorMessage = 'nope';

      t.mockFetchWith(t.response500({ text: () => expectedErrorMessage }));

      await getPlan(planId, version, dispatch);

      expect(dispatch).toHaveBeenCalledWith(actions.getPlanStart());
      expect(dispatch).toHaveBeenCalledWith(actions.getPlanError(expectedErrorMessage));
    });
  });

  describe('putPlan', () => {
    it('should put plan and dispatch success', async () => {
      const planId = 1;
      const planData = {};
      const dispatch = jest.fn();

      t.mockFetchWith(t.responseOk());

      await putPlan(planId, planData, dispatch);

      expect(dispatch).toHaveBeenCalledWith(actions.putPlanStart());
      expect(dispatch).toHaveBeenCalledWith(actions.putPlanSuccess());
    });
    it('should dispatch error when server responds with error', async () => {
      const planId = 1;
      const planData = {};
      const dispatch = jest.fn();

      t.mockFetchWith(t.response500());

      await putPlan(planId, planData, dispatch);

      expect(dispatch).toHaveBeenCalledWith(actions.putPlanStart());
      expect(dispatch).toHaveBeenCalledWith(actions.putPlanError('putPlan error'));
    });
  });
});
