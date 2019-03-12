import { useState, useEffect } from 'react';
import * as R from 'ramda';
import { fetchKnownBoards } from '../../api';

export const useKnownBoards = () => {
  const [boards, setBoards] = useState(null);
  useEffect(() => {
    fetchKnownBoards().then(boards =>
      setBoards(
        R.sortBy(
          R.prop('label'),
          R.map(b => ({ ...b, value: Number(b.boardId), label: b.backlogName }))(boards)
        )
      )
    );
  }, []);
  return boards;
};
