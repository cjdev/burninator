import { fetchBoard, fetchCompareVersions, fetchKnownBoards, updateBoardVersion } from '../';

afterEach(() => jest.restoreAllMocks());

const jsonResult = expected => ({
  json: () => Promise.resolve(expected),
});

const response500 = () => () =>
  Promise.resolve({
    ok: false,
    statusText: 'Internal Server Error',
  });

const responseOk = impl => () =>
  Promise.resolve({
    ok: true,
    statusText: 'OK',
    ...impl,
  });

const mockFetchWith = response => {
  jest.spyOn(global, 'fetch').mockImplementation(response);
};

describe('fetchKnownBoards', () => {
  it('should return all boards', async () => {
    const expected = [
      { boardId: '123', backlogName: 'NAME', isSyncing: false },
      { boardId: '124', backlogName: 'NAME124', isSyncing: true },
    ];
    mockFetchWith(responseOk(jsonResult(expected)));

    expect(fetchKnownBoards()).resolves.toEqual(expected);
    expect(global.fetch).toHaveBeenCalledWith('/api/boards');
  });
});

describe('fetchBoard', () => {
  it('should return board', async () => {
    const boardId = '597';
    const version = 'current';
    const expected = { data: 'data' };
    mockFetchWith(responseOk(jsonResult(expected)));

    expect(fetchBoard(boardId, version)).resolves.toEqual(expected);
    expect(global.fetch).toHaveBeenCalledWith(`/api/board/${boardId}/history/${version}`);
  });

  it('should throw when response not ok', async () => {
    const boardId = '597';
    const version = 'current';
    mockFetchWith(response500());

    return expect(fetchBoard(boardId, version)).rejects.toThrow();
  });
});

describe('fetchCompareVersions', () => {
  it('should return comparison data', async () => {
    const boardId = '597';
    const versions = ['current', 1550000000];
    const expected = { data: 'data' };
    mockFetchWith(responseOk(jsonResult(expected)));

    expect(fetchCompareVersions(boardId, versions)).resolves.toEqual(expected);
    expect(global.fetch).toHaveBeenCalledWith('/api/board/597/comparinator/current/1550000000');
  });
});

describe('updateBoardVersion', () => {
  it('should post update', async () => {
    const boardId = '597';
    const version = 1550000000;
    const data = { data: 'postData' };
    const expectedResponse = { ok: true };
    const expectedUrl = '/api/board/597/history/1550000000';

    mockFetchWith(responseOk(jsonResult(expectedResponse)));

    expect(updateBoardVersion({ boardId, version, data })).resolves.toEqual(expectedResponse);
    expect(global.fetch.mock.calls[0][0]).toBe(expectedUrl);

    const arg2 = global.fetch.mock.calls[0][1];
    expect(arg2.method).toBe('POST');
    expect(arg2.headers).toEqual({ 'content-type': 'application/json' });
    expect(arg2.body).toEqual(JSON.stringify(data));
  });

  it('should throw when response not ok', async () => {
    const boardId = '597';
    const version = 1550000000;
    const data = { data: 'postData' };

    mockFetchWith(response500());

    return expect(updateBoardVersion(boardId, version, data)).rejects.toThrow();
  });
});
