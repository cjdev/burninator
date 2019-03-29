import path from 'path';
import R from 'ramda';
// import mkdirp from 'mkdirp';
import fs from 'fs';
import { promisify } from 'util';
import { logger } from '../logger';
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const mkdirIfNecessary = path => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
};

export const PlanDatabase = root => {
  const rootPath = path.resolve(root);
  const plansPath = path.resolve(rootPath, 'plans');
  const getPlanIdPath = planId => path.resolve(plansPath, planId);
  const getPlanIdVersionsPath = planId => path.resolve(getPlanIdPath(planId), 'versions');

  mkdirIfNecessary(rootPath);
  mkdirIfNecessary(plansPath);

  const listPlanVersions = planId => {
    return fs.readdirSync(getPlanIdVersionsPath(planId));
  };

  const getPathToVersion = (planId, version = 'current') => {
    // if current, figure out the latest
    // otherwise, try to get the version specified
    if (version === 'current') {
      const allVersions = listPlanVersions(planId);
      if (allVersions.length === 0) throw Error('Not found');
      const latest = R.last(allVersions.sort());
      // logger.debug('latest file: ', latest);
      return path.resolve(getPlanIdVersionsPath(planId), latest);
    }
    return path.resolve(getPlanIdVersionsPath(planId), version);
  };

  const getPlan = async (planId, version) => {
    const pathToVersion = await getPathToVersion(planId, version);
    logger.silly('pathToVersion: ', version, pathToVersion);

    const planData = await readFile(pathToVersion);
    return planData.toString();
  };

  /////////////////////////////////////////

  const putPlan = async (planId, planData) => {
    const filename = path.resolve(getPlanIdVersionsPath(planId), Date.now().toString());
    logger.debug('PlanDB.putPlan.filename: ', filename);
    await writeFile(filename, JSON.stringify(planData, null, 1));
  };

  return {
    getPlan,
    putPlan,

    // get,
    // getA,
    // getP,
    // getSync,
    // put,
    // putP,
    // list,
    // listPath,
    // exists,
  };
};
