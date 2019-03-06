import path from 'path';
import R from 'ramda';
import uuid from 'uuid/v1';
import SyncState from './syncState';
import { sync } from './sync/core';
import opts from './opts';
import { logger, time, timedHandler } from './logger';
import { SimpleDatabase } from './SimpleDatabase';

const boardDir = path.resolve(opts.dataDir, 'boards');

const db2 = SimpleDatabase(boardDir);
const syncState = new SyncState(boardDir);
const bufToJSON = buf => JSON.parse(buf.toString());

const versionOrNow = versionSpec =>
  versionSpec === 'current' ? Date.now() : parseInt(versionSpec, 10);

const getConfigForBoard = async (boardId, version) => {
  const configBuf = await configAsOf(boardId, versionOrNow(version));
  return configBuf ? JSON.parse(configBuf) : {};
};

const getLatestBoardFileName = async boardId => R.last(db2.listPath(`${boardId}/history`).sort());

const getPathToVersion = async (boardId, version) => {
  const filePath =
    version === undefined || version === 'current'
      ? `history/${await getLatestBoardFileName(boardId)}`
      : `history/${version}`;
  return `${boardId}/${filePath}`;
};

const noopTimer = {
  update: () => {},
};

const getBoard = async (boardId, version = 'current', timer = noopTimer) => {
  const filePath = await getPathToVersion(boardId, version);
  // timer.update('getBoard: POST getPathToVersion');

  const configurationSettings = await time('CONFIG', async () => {
    return await getConfigForBoard(boardId, version);
  });

  // timer.update('getBoard POST getConfigForBoard');
  const status = syncState.getSyncStatus(boardId);
  const boardData = await db2.getP(filePath);
  // timer.update(`getBoard POST getP`);
  return {
    ...bufToJSON(boardData),
    configurationSettings,
    status,
  };
};

const configAsOf = async (boardId, when) => {
  const allConfigs = db2.listPath(`${boardId}/config`);
  logger.silly(`allConfigs ${allConfigs}`);

  const latest = await time('LATEST', async () => {
    return await R.pipe(
      R.map(x => parseInt(x, 10)),
      R.sort(R.comparator(R.lt)),
      R.filter(x => x <= when),
      R.last
    )(allConfigs);
  });

  if (latest) {
    return await db2.getA(`${boardId}/config/${latest}`);
  } else {
    return null;
  }
};

const wrapAsync = fn => {
  return (req, res, next) => {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
};

// handlers ---------------------------------------------------------------
//
export const handleGetBoards = (req, res) => {
  const boards = syncState.getBoards();
  logger.silly(boards);
  res.json(boards);
};

export const handleGetBoardStatus = (req, res) => {
  res.json(syncState.getSyncStatus(req.params.boardId));
};

export const handleGetBoardHistory = (req, res) => {
  timedHandler(req, () => {
    const { boardId } = req.params;
    const fileNames = db2.listPath(`${boardId}/history`);

    const versionData = R.pipe(
      R.map(fileName => JSON.parse(db2.getSync(`${boardId}/history/${fileName}`))),
      R.map(R.pick(['lastUpdate', 'versionArchive', 'versionName']))
    )(fileNames);
    logger.silly(`versionData: ${versionData}`);
    res.json(versionData);
  });
};

export const handleGetBoard = wrapAsync(async (req, res) => {
  timedHandler(req, async t => {
    t.update('getBoard PRE');
    const { boardId, version } = req.params;
    const board = await getBoard(boardId, version, t);
    res.json(board);
    t.update('getBoard POST');
  });
});

export const handleGetBoardComparinator = wrapAsync(async (req, res, next) => {
  const { boardId } = req.params;
  const versionsParam = req.params[0].split('/');
  const versionData = await Promise.all(
    R.map(version => getBoard(boardId, version))(versionsParam)
  );
  res.json({ versions: R.zipWith((p, v) => ({ p: v }), versionsParam, versionData) });
});

export const handleGetBoardConfigurationHistory = (req, res) => {
  const boardId = req.params.boardId;
  res.json(db2.listPath(`${boardId}/config`));
};

export const handleGetBoardConfigurationVersion = wrapAsync(async (req, res) => {
  const when = versionOrNow(req.params.version);
  const configBuf = await configAsOf(req.params.boardId, when);
  if (!configBuf) {
    res.status(404).send('No config');
    return;
  }
  const config = JSON.parse(configBuf);
  logger.silly('CONFIGURATION', config);
  res.json(config);
});

const getName = R.view(R.lensPath(['body', 'versionName']));
const getArchive = R.view(R.lensPath(['body', 'versionArchive']));

export const handlePostBoardVersion = wrapAsync(async (req, res) => {
  const { boardId, version } = req.params;
  const name = getName(req);
  const archive = getArchive(req);
  const existing = await getBoard(boardId, version);
  if (name !== undefined) existing.versionName = name;
  if (archive !== undefined) existing.versionArchive = archive;
  await db2.putP(`${boardId}/history/${version}`, JSON.stringify(existing, null, '  '));
  const updated = await getBoard(boardId, version);
  res.json(updated);
});

export const handlePutBoardConfiguration = wrapAsync(async (req, res) => {
  const json = JSON.stringify(req.body);
  const config = await db2.putP(`${req.params.boardId}/config/${Date.now()}`, json);
  res.json(config);
});

export const handleGetResetBoard = wrapAsync(async (req, res) => {
  const boardId = req.params.boardId;
  try {
    syncState.startSync(boardId);
    logger.warn(`resetting boardId: ${boardId}`);
    const postSyncBoard = await sync({
      boardId,
      auth: opts.auth,
      dataDir: boardDir,
    });
    await db2.putP(
      `${boardId}/history/${postSyncBoard.lastUpdate}`,
      JSON.stringify(postSyncBoard, null, ' ')
    );
    syncState.stopSync(boardId);
    const newBoard = await getBoard(boardId);
    res.status(200).json(newBoard);
  } catch (err) {
    syncState.stopSync(boardId, err);
    throw err;
  }
});

const syncBoard = async (existingData, boardId, syncUpdate = () => {}) => {
  logger.silly(`existingData: ${existingData}`);
  syncState.startSync(boardId);
  logger.warn(`syncing boardId: ${boardId}`);
  syncUpdate('syncing');
  const postSyncBoard = await sync(
    {
      boardId,
      auth: opts.auth,
      dataDir: boardDir,
    },
    existingData,
    syncUpdate
  );
  syncUpdate('saving board data...');
  await db2.putP(
    `${boardId}/history/${postSyncBoard.lastUpdate}`,
    JSON.stringify(postSyncBoard, null, ' ')
  );
  syncState.stopSync(boardId);
  return await getBoard(boardId);
};

export const handleGetSyncBoard = wrapAsync(async (req, res) => {
  const boardId = req.params.boardId;
  try {
    const existingData = await getBoard(boardId);
    const fileExists = existingData !== null;
    if (!fileExists) {
      handleGetResetBoard(req, res);
      return;
    }
    const newBoard = await syncBoard(existingData, boardId);
    res.status(200).json(newBoard);
  } catch (err) {
    syncState.stopSync(boardId, err);
    throw err;
  }
});

const emitSyncUpdate = (event, socket, id) => message => {
  socket.emit(event, { id, ts: Date.now(), message });
};

export const handleSocketSync = socket => {
  const id = uuid();
  socket.on('sync', async (data, ack) => {
    const update = emitSyncUpdate('syncUpdate', socket, id);
    const { boardId } = data;
    logger.info('sync', data, id);
    ack(id);
    try {
      update('getting existing board data...');
      const existingData = await getBoard(boardId);
      const newBoard = await syncBoard(existingData, boardId, update);
      update('...sync complete');
      socket.emit('syncComplete', newBoard);
    } catch (err) {}
  });
  socket.on('reset', async (data, ack) => {
    const update = emitSyncUpdate('resetUpdate', socket, id);
    const { boardId } = data;
    logger.info('reset', data, id);
    ack(id);
    try {
      const newBoard = await syncBoard(null, boardId, update);
      update('...reset complete');
      socket.emit('resetComplete', newBoard);
    } catch (err) {}
  });
  socket.on('disconnect', () => {
    logger.info('disconnect', id);
  });
  logger.info('connected', id);
};

export const handleChangelog = (req, res) =>
  res.sendFile(path.resolve(__dirname, '../CHANGELOG.md'));

export const handleDefault = (req, res) =>
  res.sendFile(path.resolve(__dirname, '../build/index.html'));
