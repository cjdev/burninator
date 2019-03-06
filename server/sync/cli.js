import fs from 'fs';
import assert from 'assert';
import { argv } from 'yargs';
import opts2, { logger } from '../opts';
import { sync } from './core';

const opts = {
  ...opts2,
  boardId: parseInt(argv._[0], 10),
};

logger.warn('==[ sync ]=====================================================');
logger.info('LOG_LEVEL', process.env.LOG_LEVEL);
logger.info('user     ', opts.auth.username);
logger.info('dataDir  ', opts.dataDir);
logger.info('boardId: ', opts.boardId);

assert.ok(opts.auth.username, 'Missing username');
assert.ok(opts.auth.password, 'Missing password');
assert.ok(opts.boardId, 'Missing boardId');

// ============================================================================

const getExistingData = boardId => {
  const fileName = `./data/${boardId}/jira-data.json`;
  if (!fs.existsSync(fileName)) {
    logger.info('no file exists', fileName);
    return null;
  }

  const boardJson = JSON.parse(fs.readFileSync(fileName, 'utf8'));
  logger.silly(boardJson);
  return boardJson;
};

const existing = getExistingData(opts.boardId);

sync(opts, existing).then(done => logger.info('done', done));
