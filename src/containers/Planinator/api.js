import { actions } from './state';

export const getPlan = async (planId, version, dispatch) => {
  try {
    dispatch(actions.getPlanStart());
    const res = await fetch(`/api/planinator/${planId}/${version || 'current'}`);
    if (!res.ok) throw Error(await res.text());
    const json = await res.json();
    dispatch(actions.getPlanSuccess(json));
  } catch (err) {
    dispatch(actions.getPlanError(err.message));
  }
};

export const putPlan = async (planId, planData, dispatch) => {
  console.log('putPlan: ', { planId });
  try {
    dispatch(actions.putPlanStart());
    const res = await fetch(`/api/planinator/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
      headers: {
        'content-type': 'application/json',
      },
    });
    if (!res.ok) throw Error('putPlan error');
    dispatch(actions.putPlanSuccess());
  } catch (err) {
    dispatch(actions.putPlanError(err.message));
  }
};
