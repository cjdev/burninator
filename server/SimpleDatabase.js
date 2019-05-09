import path from 'path';
import mkdirp from 'mkdirp';
import fs from 'fs';
import { promisify } from 'util';
import { time, timeSync } from './logger';
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readDir = promisify(fs.readdir);
const existsPath = promisify(fs.exists);

export const SimpleDatabase = root => {
  const rootPath = path.resolve(root);

  if (!fs.existsSync(rootPath)) {
    fs.mkdirSync(rootPath);
  }

  const getPathForId = id => path.resolve(rootPath, `${id}`);

  const get = (id, cb) => {
    // console.log('get id: ', id);
    fs.readFile(getPathForId(id), cb);
  };

  const getSync = id =>
    timeSync(`getSync (${id})`, () => fs.readFileSync(getPathForId(id), 'utf8'));

  const getA = async id => await readFile(getPathForId(id));

  const getP = id => readFile(getPathForId(id));

  const put = (id, data, cb) => {
    const pathForId = getPathForId(id);
    // create parent dir(s) if needed
    mkdirp.sync(path.dirname(pathForId));
    fs.writeFile(pathForId, data, cb);
  };

  const putP = (id, data) => {
    const pathForId = getPathForId(id);
    // create parent dir(s) if needed
    mkdirp.sync(path.dirname(pathForId));
    return writeFile(pathForId, data);
  };

  const list = () => {
    // console.log('list rootPath: ', rootPath);
    return fs.readdirSync(rootPath);
  };

  const asyncListPath = async id => {
    const have = await asyncExists(id);
    if (have) {
        return await readDir(getPathForId(id));
    } else {
        return [];
    }
  };

  const listPath = id => {
    // console.log('listPath rootPath, id: ', rootPath, id, exists(id));
    return exists(id) ? fs.readdirSync(getPathForId(id)) : [];
  };

  const asyncExists = async id => {
    return await existsPath(getPathForId(id));
  };

  const exists = id => {
    // console.log('listPath rootPath, id: ', rootPath, id);
    return fs.existsSync(getPathForId(id));
  };

  return {
    get,
    getA,
    getP,
    getSync,
    put,
    putP,
    list,
    asyncListPath,
    listPath,
    asyncExists,
    exists,
  };
};
