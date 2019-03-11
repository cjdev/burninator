import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro';
import * as R from 'ramda';
import ReactSelector from 'react-select';
import { fetchKnownBoards } from '../../../../api';

const Select = styled(ReactSelector)`
  margin-bottom: 0.8rem;
`;

export const BoardSelector = props => {
  const [boards, setBoards] = useState(null);
  useEffect(() => {
    fetchKnownBoards().then(boards =>
      setBoards(
        R.sortBy(
          R.prop('label'),
          R.map(b => ({ value: Number(b.boardId), label: b.backlogName }))(boards)
        )
      )
    );
  }, []);

  return <Select options={boards} {...props} />;
};
BoardSelector.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.number,
};
