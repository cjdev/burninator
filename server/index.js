import express from 'express';
import { inspect } from 'util';
import { Server } from 'http';
import bodyParser from 'body-parser';
import path from 'path';
import opts from './opts';
import { logger, expressLogger } from './logger';
import * as H from './handlers';
import * as planinator from './planinator';
import SocketIO from 'socket.io';
import cors from 'cors';
import { addAuth } from './auth';

opts.logEnv(logger);

const app = express();
const server = Server(app);
const ioSync = SocketIO(server);

ioSync.on('connection', H.handleSocketSync);
// HACK around the CRA proxy issue
if (opts.useDirectSocketPort) {
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.log('!! USING CORS TO ALLOW DIRECT SOCKET CONNECTIONS.    !!');
  console.log('!! THIS SHOULD ONLY BE FOR LOCAL DEV                 !!');
  console.log('!! FIND THE REACT_APP_USE_DIRECT_SOCKET_PORT ENV VAR !!');
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  app.use(cors());
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressLogger);
app.use(express.static(path.join(__dirname, '..', 'build')));
addAuth(app, logger);

app.get('/api/planinator/:planId/:version?', planinator.handleGetPlan);
app.put('/api/planinator/:planId', planinator.handlePutPlan);

app.get('/api/changelog/', H.handleChangelog);
app.get('/api/boards/', H.handleGetBoards);
app.get('/api/board/:boardId/comparinator/*', H.handleGetBoardComparinator);
app.get('/api/board/:boardId/configuration/history', H.handleGetBoardConfigurationHistory);
app.get('/api/board/:boardId/configuration/:version', H.handleGetBoardConfigurationVersion);
app.put('/api/board/:boardId/configuration', H.handlePutBoardConfiguration);
app.get('/api/board/:boardId/history/:version', H.handleGetBoard);
app.post('/api/board/:boardId/history/:version', H.handlePostBoardVersion);
app.get('/api/board/:boardId/history', H.handleGetBoardHistory);
app.get('/api/board/:boardId/status', H.handleGetBoardStatus);
app.get('/api/board/:boardId', H.handleGetBoard);
app.get('/api/sync/:boardId', H.handleGetSyncBoard);
app.get('/api/reset/:boardId', H.handleGetResetBoard);
app.get('/*', H.handleDefault);

const logError = error => {
  logger.silly(inspect(error));
  logger.error(error);
  logger.debug(`error.code: ${error.code}`);
};
const sendError = (res, status, message) => res.status(status).json({ message });

app.use(function handleError(error, req, res, next) {
  logError(error);
  if (error.code === 'ENOENT' || error.code === 'ENOTFOUND') {
    sendError(res, 404, error.message);
  } else {
    sendError(res, 500, error.message);
  }
});

const startServer = () => {
  const PORT = opts.API_PORT;
  server.listen(PORT, () => {
    logger.info(`Server running at: http://localhost:${PORT}/`);
  });
  server.keepAliveTimeout = 60000;
};

startServer();
