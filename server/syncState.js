import R from 'ramda';
import moment from 'moment';
import { sprintf } from 'sprintf-js';
import { SimpleDatabase } from './SimpleDatabase';
import { logger } from './logger';

const dformat = 'YYYYMMDD_HHmmss';

export default class SyncState {
  ctx = 'SyncState';

  constructor(dataDir) {
    this.db = SimpleDatabase(dataDir);
    this.state = R.pipe(
      R.map(boardId => this.getBoardData(boardId)),
      R.filter(data => data),
      R.reduce((acc, data) => R.merge(acc, { [data.boardId]: data }), {})
    )(this.db.list());
    this.logState('init');
  }

  getBoardData = boardId => {
    const latest = R.last(this.db.listPath(`${boardId}/history`).sort());
    const fileName = `${boardId}/history/${latest}`;
    logger.silly(`fileName: ${fileName}`);

    if (this.db.exists(fileName)) {
      const boardJson = JSON.parse(this.db.getSync(fileName));
      return {
        boardId,
        backlogName: boardJson.backlogName,
        isSyncing: false,
        lastUpdate: boardJson.lastUpdate,
      };
    }
    return null;
  };

  maybeFormatMoment = function matbeFormatMoment(maybeMoment) {
    return maybeMoment ? maybeMoment.format(dformat) : '-';
  };

  formatString = `%4s: %-25s %-${dformat.length}s %s %-${dformat.length}s %-${dformat.length}s %s`;

  printState = prefix => d => {
    logger.debug(
      `${prefix || '_state'} ${sprintf(
        this.formatString,
        d.boardId,
        d.backlogName ? d.backlogName.substring(0, 25) : '????',
        this.maybeFormatMoment(moment(d.lastUpdate)),
        d.isSyncing ? 'S' : d.result ? 'E' : '.',
        this.maybeFormatMoment(d.startTime),
        this.maybeFormatMoment(d.completeTime),
        d.elapsed || '-'
      )}`
    );
  };

  logState = prefix => {
    R.forEach(this.printState(prefix), R.values(this.state));
  };

  getBoards = () => R.values(this.state);

  getSyncStatus = boardId => {
    const val = this.state[boardId];
    if (!val) {
      return {
        boardId,
        isSyncing: false,
      };
    }
    return val;
  };

  startSync = boardId => {
    logger.info('startSync', boardId);
    this.state[boardId] = R.merge(this.state[boardId], {
      boardId,
      isSyncing: true,
      startTime: moment(),
      completeTime: '',
    });
    this.logState('startSync');
  };

  stopSync = (boardId, err) => {
    logger.warn('stopSync', boardId, err);
    if (err) {
      delete this.state[boardId];
    } else {
      const updatedBoardData = this.getBoardData(boardId);
      const startTime = this.state[boardId].startTime;
      const completeTime = moment();
      const elapsed = completeTime.diff(startTime);

      this.state[boardId] = R.merge(this.state[boardId], {
        backlogName: updatedBoardData.backlogName,
        isSyncing: false,
        completeTime,
        elapsed,
        result: err ? err.message : 'OK',
        lastUpdate: updatedBoardData.lastUpdate,
      });
    }
    this.logState('stopSync');
  };
}
