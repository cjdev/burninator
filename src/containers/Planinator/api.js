import { actions } from './state';

// const assertOk = response => {
//   return response.then(r => {
//     if (!r.ok) {
//       r.text().then(text => {
//         throw Error(text);
//       });
//     } else {
//       return response;
//     }
//   });
// };

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
