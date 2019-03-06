import * as R from 'ramda';
import { handleActions } from 'redux-actions';
import * as Actions from '../actions';
import Board from '../../domain/Board';
import { mapIndex } from '../../utils';

const lastUpdate = R.view(R.lensPath(['boardData', 'lastUpdate']));
const sortVersionsOldToNew = R.sortBy(lastUpdate);

const tagReleasesWithPosition = (releases, boardIx, idx) =>
  R.map(R.assoc('position', idx))(releases);

const tagAllReleases = mapIndex((v, idx) => ({
  ...v,
  jiraVersions: tagReleasesWithPosition(v.jiraVersions, v.boardIx, idx),
}));

const getAllReleases = R.pipe(
  R.pluck('jiraVersions'),
  R.flatten,
  R.groupBy(R.prop('id'))
);

const buildReleaseMatrix = R.mapObjIndexed(releaseValues => {
  return R.reduce(
    (acc, v) => {
      acc[v.position] = v;
      return acc;
    },
    [],
    releaseValues
  );
});

// input : {
//  123: [{}, {}, {}],
//  456: [{}, {}, {}],
// }
//
// transform into:
//   [{
//      id: 123,
//      latest: {c},
//      data: [{a}, {b}, {c}],
//    },
//    {
//      id: 456,
//      latest: {z},
//      data: [{x}, {y}, {z}],
//   }]
//
//   then sort by last.completedDatePadded and ordinal
const sortReleases = releases =>
  R.pipe(
    R.keys,
    R.map(id => {
      const lastVersion = R.last(releases[id]);
      const lastStory = R.last(R.sortBy(R.prop('ordinal'))(lastVersion.issues));
      const lastCompletedWeekPadded = lastVersion.completedWeekPadded;

      return {
        id,
        lastVersion,
        lastCompletedWeekPadded,
        lastStoryOrdinal: lastStory.ordinal,
        dataByPosition: releases[id],
      };
    }),
    R.sortWith([R.ascend(R.prop('lastCompletedWeekPadded')), R.ascend(R.prop('lastStoryOrdinal'))])
  )(releases);

const toComparinatorData = versions => {
  // 0 tag each release in each board with the board's sorted position
  // 1 group all the unique releases by id
  //   - not every board will have every release
  // 2 for each release, build an array[boards.length]
  //   - fill each cell of the array with the release data with the matching position
  //   - there will be empty cells!
  // 3 sort the release list by the latest cell's completed date

  const sortedVersions = sortVersionsOldToNew(versions);
  const versionsWithTaggedReleases = tagAllReleases(sortedVersions);
  const allReleases = getAllReleases(versionsWithTaggedReleases);
  const allReleasesWithPositionedData = buildReleaseMatrix(allReleases, sortedVersions.length);
  return sortReleases(allReleasesWithPositionedData);
};

const toBoards = boardId =>
  R.map(versionKeyedById => new Board(boardId, R.head(R.values(versionKeyedById))));

const sortBoardsOldToNew = boards => R.sortBy(R.prop('basisDate'))(boards);

const initialState = {
  loading: false,
  error: null,
  versions: [],
};

export const reducer = handleActions(
  {
    [Actions.getCompareVersionsRequest]: state => ({
      ...state,
      loading: true,
      error: null,
    }),
    [Actions.getCompareVersionsSuccess]: (state, action) => {
      const { boardId, compareData } = action.payload;
      const boards = toBoards(boardId)(compareData.versions);
      return {
        ...state,
        loading: false,
        error: null,
        versions: sortBoardsOldToNew(boards),
        comparinatorData: toComparinatorData(boards),
      };
    },
    [Actions.getCompareVersionsFailure]: (state, action) => ({
      ...state,
      loading: false,
      error: action.payload,
      versions: [],
    }),
  },
  initialState
);

export const getComparinator = state => ({
  comparinator: state,
});
