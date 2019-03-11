import { DateRangeForm } from './DateRangeForm';
import { BuildPhaseForm } from './BuildPhaseForm';

const phaseFormMap = {
  assess: DateRangeForm,
  design: DateRangeForm,
  build: BuildPhaseForm,
  launch: DateRangeForm,
  complete: DateRangeForm,
};

export const getPhaseForm = phase => {
  if (!phase) return null;
  return phaseFormMap[phase];
};
