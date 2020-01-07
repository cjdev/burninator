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

const getLatestBoardFileName = async boardId => {
    const hist = await db2.asyncListPath(`${boardId}/history`);
    return R.reduce(R.max, 0, hist);
}

const getPathToVersion = async (boardId, version) => {
  const filePath =
    version === undefined || version === 'current'
      ? `history/${await getLatestBoardFileName(boardId)}`
      : `history/${version}`;
  return `${boardId}/${filePath}`;
};

const getPathToMeta = async (boardId, version) => {
  const filePath =
    version === undefined || version === 'current'
      ? `meta/${await getLatestBoardFileName(boardId)}`
      : `meta/${version}`;
  return `${boardId}/${filePath}`;
};

export const getBoard = async (boardId, version = 'current') => {
  const filePath = await getPathToVersion(boardId, version);
  const metaPath = await getPathToMeta(boardId, version);

  const configurationSettings = await getConfigForBoard(boardId, version);

  const status = syncState.getSyncStatus(boardId);
  const boardData = await db2.getP(filePath);
  const metaData = db2.exists(metaPath) ? await db2.getP(metaPath) : "{}";

  return {
    ...bufToJSON(boardData),
    ...bufToJSON(metaData),
    configurationSettings,
    status,
  };
};

const configAsOf = async (boardId, when) => {
  const allConfigs = await db2.asyncListPath(`${boardId}/config`);
  logger.silly(`allConfigs ${allConfigs}`);

  const latest = R.pipe(
      R.map(x => parseInt(x, 10)),
      R.sort(R.comparator(R.lt)),
      R.filter(x => x <= when),
      R.last
    )(allConfigs);

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


const asyncHandleGetBoardHistory = async (req, res) => {
    const { boardId } = req.params;

    const fileNames = await db2.asyncListPath(`${boardId}/history`);

    const verdat = async fn => {

        const version = fn;
        const dataPath = await getPathToVersion(boardId, version);
        const metaPath = await getPathToMeta(boardId, version);


        const hasMeta = await db2.asyncExists(metaPath);
        let meta;

        if(!hasMeta) {
          const raw = await db2.getP(dataPath);
          const jsonData = JSON.parse(raw);
          meta = R.pick(['lastUpdate', 'versionArchive', 'versionName'], jsonData);
          // write it so this is fast next time.
          await db2.putP(metaPath, JSON.stringify(meta));
        } else {
          const rawMeta = await db2.getP(metaPath);
          meta = JSON.parse(rawMeta);
        }
        return meta;
    };

    const versionData = await Promise.all(R.map(verdat, fileNames));

    logger.silly(`versionData: ${versionData}`);
    res.json(versionData);
};

export const handleGetBoardHistory = wrapAsync(asyncHandleGetBoardHistory);

const asyncHandleGetBoard = async (req, res) => {
    const { boardId, version } = req.params;
    const board = await getBoard(boardId, version);
    res.json(board);
};

export const handleGetBoard = wrapAsync(asyncHandleGetBoard);


export const handleGetBoardComparinator = wrapAsync(async (req, res, next) => {
  const { boardId } = req.params;
  const versionsParam = req.params[0].split('/');
  const versionData = await Promise.all(
    R.map(version => getBoard(boardId, version))(versionsParam)
  );
  res.json({ versions: R.zipWith((p, v) => ({ p: v }), versionsParam, versionData) });
});

const asyncHandleGetBoardConfigurationHistory = async (req, res) => {
  const boardId = req.params.boardId;
  const  hist = await db2.asyncListPath(`${boardId}/config`);
  res.json(hist);
};

export const handleGetBoardConfigurationHistory = wrapAsync(asyncHandleGetBoardConfigurationHistory);


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

  const meta = R.pick(['lastUpdate', 'versionArchive', 'versionName'], existing);

  if (name !== undefined) meta.versionName = name;
  if (archive !== undefined) meta.versionArchive = archive;
  await db2.putP(await getPathToMeta(boardId, version), JSON.stringify(meta, null, '  '));

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
      await getPathToVersion(boardId, postSyncBoard.lastUpdate),
      JSON.stringify(postSyncBoard, null, ' ')
    );
    await db2.putP(
      await getPathToMeta(boardId, postSyncBoard.lastUpdate),
      JSON.stringify({lastUpdate: postSyncBoard.lastUpdate})
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
    await getPathToVersion(boardId, postSyncBoard.lastUpdate),
    JSON.stringify(postSyncBoard, null, ' ')
  );
  await db2.putP(
    await getPathToMeta(boardId, postSyncBoard.lastUpdate),
    JSON.stringify({lastUpdate: postSyncBoard.lastUpdate})
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

export const handleHealth = (req, res) => {
    const mused = Math.round(process.memoryUsage().heapUsed / 10485.76) / 100;
    console.log("Memory In Use: ", mused, "MB");
    res.json({});
}
