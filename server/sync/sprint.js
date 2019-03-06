import * as R from 'ramda';

export const debugSprint = s => ({
  id: s.id,
  name: s.name,
  state: s.state,
  issueCount: s.issues ? s.issues.length : 0,
});

export const debugSprints = ss => R.map(debugSprint, ss);
export const findSprintById = id => R.find(R.propEq('id', id));
