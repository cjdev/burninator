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
