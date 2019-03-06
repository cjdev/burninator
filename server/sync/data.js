// import fs from 'fs';
// import mkdirp from 'mkdirp';
// import path from 'path';
// import * as R from 'ramda';
// import { logger } from '../logger';

// const historyDirectory = (dataDir, boardId) => {
//   const directory = path.resolve(dataDir, `${boardId}/history`);
//   mkdirp.sync(directory);
//   return directory;
// };

// export const getVersions = ({ dataDir, boardId }) => {
//   const directory = historyDirectory(dataDir, boardId);
//   return R.map(fileName => {
//     const data = JSON.parse(fs.readFileSync(path.resolve(directory, fileName), 'utf8'));
//     return R.pick(['lastUpdate', 'versionArchive', 'versionName'])(data);
//   })(fs.readdirSync(directory));
// };

// export const getHistoryFile = (data, opts) => {
//   const ctx = '[getHistoryFile]';
//   logger.silly(ctx, data);

//   const directory = historyDirectory(opts.dataDir, opts.boardId);

//   const fileName = path.resolve(directory, `${data.lastUpdate}`);
//   logger.silly(ctx, 'attempting to write', fileName);

//   try {
//     fs.writeFileSync(fileName, JSON.stringify(data, null, '  '));
//     logger.info(ctx, `File written: ${fileName}`);
//   } catch (e) {
//     logger.error(ctx, e);
//   }
// };

// export const writeHistoryFile = (data, opts) => {
//   const ctx = '[writeHistoryFile]';
//   logger.silly(ctx, data);

//   const directory = historyDirectory(opts.dataDir, opts.boardId);

//   const fileName = path.resolve(directory, `${data.lastUpdate}`);
//   logger.silly(ctx, 'attempting to write', fileName);

//   try {
//     fs.writeFileSync(fileName, JSON.stringify(data, null, '  '));
//     logger.info(ctx, `File written: ${fileName}`);
//   } catch (e) {
//     logger.error(ctx, e);
//   }
// };

// export const writeFile = (data, opts) => {
//   writeHistoryFile(data, opts);

//   const ctx = '[writeFile]';
//   logger.silly(ctx, data);

//   const directory = path.resolve(opts.dataDir, `${opts.boardId}/`);
//   mkdirp.sync(directory);

//   const fileName = path.resolve(directory, 'jira-data.json');
//   logger.silly(ctx, 'attempting to write', fileName);

//   try {
//     fs.writeFileSync(fileName, JSON.stringify(data, null, '  '));
//     logger.info(ctx, `File written: ${fileName}`);
//   } catch (e) {
//     logger.error(ctx, e);
//   }
// };
