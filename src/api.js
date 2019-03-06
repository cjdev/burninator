import io from 'socket.io-client';

const socketPort = process.env.REACT_APP_USE_DIRECT_SOCKET_PORT;
const socketServerUrl = socketPort ? `http://localhost:${socketPort}` : '';

export const fetchBoard = (boardId, version) =>
  fetch(`/api/board/${boardId}/history/${version}`).then(response => {
    if (!response.ok) {
      throw new Error(response.statusText);
    } else return response.json();
  });

export const fetchKnownBoards = () => fetch('/api/boards').then(response => response.json());

export const fetchCompareVersions = (boardId, versions) =>
  fetch(`/api/board/${boardId}/comparinator/${versions.join('/')}`).then(response => {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response.json();
  });

export const syncBoard = ({ boardId }, getSyncUpdate) => {
  const socket = io(socketServerUrl);
  // socket.on('connect', () => console.log('connected'));
  return new Promise(res => {
    socket.on('syncUpdate', getSyncUpdate);
    socket.on('syncComplete', data => {
      // console.log('syncComplete.data: ', data);
      socket.disconnect();
      res(data);
    });
    socket.on('syncError', data => {
      // console.log('syncError: ', data);
      throw new Error(data);
    });
    socket.emit('sync', { boardId }, guid => {
      // console.log('sync started: ', guid);
    });
  });
};

export const resetBoard = ({ boardId }, getSyncUpdate) => {
  const socket = io(socketServerUrl);
  // socket.on('connect', () => console.log('connected'));
  return new Promise(res => {
    socket.on('resetUpdate', getSyncUpdate);
    socket.on('resetComplete', data => {
      // console.log('syncComplete.data: ', data);
      socket.disconnect();
      res(data);
    });
    socket.on('resetError', data => {
      // console.log('syncError: ', data);
      throw new Error(data);
    });
    socket.emit('reset', { boardId }, guid => {
      // console.log('sync started: ', guid);
    });
  });
};

export const updateBoardVersion = async ({ boardId, version, data }) => {
  try {
    const response = await fetch(`/api/board/${boardId}/history/${version}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'content-type': 'application/json',
      },
    });
    return await response.json();
  } catch (err) {
    console.log('updateBoardVersion err: ', err);
    throw err;
  }
};
