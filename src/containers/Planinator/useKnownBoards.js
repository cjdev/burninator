import { useState, useEffect } from 'react';
import * as R from 'ramda';
import { fetchKnownBoards } from '../../api';

export const useKnownBoards = () => {
  const [boards, setBoards] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const boardData = await fetchKnownBoards();
      setBoards({
        values: R.sortBy(
          R.prop('label'),
          R.map(b => ({ ...b, value: Number(b.boardId), label: b.backlogName }))(boardData)
        ),
        byId: R.indexBy(R.prop('boardId'), boardData),
      });
    };
    fetch();
  }, []);
  return boards;
};
