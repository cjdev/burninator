import R from 'ramda';
import path from 'path';
import dotenv from 'dotenv';

const env = dotenv.config();
if (env.error) {
  throw new Error(env.error);
}

const requiredEnvFields = [
  'JIRA_USERNAME',
  'JIRA_PASSWORD',
  'JIRA_ROOT_URL',
  'REACT_APP_JIRA_ROOT_URL',
];

const defaults = {
  API_PORT: 3001,
  LOG_LEVEL: 'info',
  nodeVersion: process.version,
  appVersion: process.env.REACT_APP_VERSION,
  gitHash: process.env.REACT_APP_GIT_HASH,
  dataDir: path.resolve(__dirname, '../data/'),
  useDirectSocketPort: process.env.REACT_APP_USE_DIRECT_SOCKET_PORT !== undefined,
  PROFILING_THRESHOLD_MS: 5000,
  authProvider: process.env.REACT_APP_AUTH_PROVIDER || 'None',
};

const validateRequiredFields = opts => {
  const missing = R.without(R.keys(opts), requiredEnvFields);
  if (missing.length) {
    throw new Error(`Required .env value(s) missing: ${missing.join(', ')}`);
  }
};

const spaces = (prop, length) =>
  R.range(0, length - prop.length)
    .map(a => '.')
    .join('');

const logWith = logger => prop => logger.info(`${prop}${spaces(prop, 34)}${opts[prop]}`);

const opts = {
  ...defaults,
  ...env.parsed,
  auth: {
    username: env.parsed.JIRA_USERNAME,
    password: env.parsed.JIRA_PASSWORD,
  },
  logEnv: logger => {
    const l = logWith(logger);
    l(`nodeVersion`);
    l(`appVersion`);
    l(`gitHash`);
    l(`dataDir`);
    l(`authProvider`);

    l('API_PORT');
    l(`JIRA_ROOT_URL`);
    l(`JIRA_USERNAME`);
    l(`LOG_LEVEL`);
    l(`REACT_APP_JIRA_ROOT_URL`);
    l(`REACT_APP_USE_DIRECT_SOCKET_PORT`);
    l(`PROFILING_THRESHOLD_MS`);
  },
};
// console.log(JSON.stringify(opts, null, 2));
validateRequiredFields(opts);

export default opts;
