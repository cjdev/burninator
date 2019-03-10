import { useState, useContext, useEffect } from 'react';
import PlaninatorContext from './context';
import { getPlan, putPlan } from './api';

export const useModalPlanUpdater = (getUpdatedPlan, closeModal) => {
  const { state, dispatch, planId, version } = useContext(PlaninatorContext);
  const { putApiMeta } = state;

  const [updating, setUpdating] = useState(false);
  useEffect(() => {
    if (updating && !putApiMeta.loading && !putApiMeta.error) {
      closeModal();
      getPlan(planId, version, dispatch);
      setUpdating(false);
    }
  }, [updating, closeModal, putApiMeta, planId, version, dispatch]);

  const handler = () => {
    // if null is returns from getUpdatedPlan, don't update
    const newPlan = getUpdatedPlan(state);
    if (newPlan) {
      setUpdating(true);
      putPlan(planId, newPlan, dispatch);
    }
  };
  return { state, updating, setUpdating, handler };
};
