import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro';
import ReactSelector from 'react-select';
import { useKnownBoards } from '../../useKnownBoards';

const Select = styled(ReactSelector)`
  margin-bottom: 0.8rem;
`;

export const BoardSelector = props => {
  const boards = useKnownBoards();
  return <Select options={boards} {...props} />;
};
BoardSelector.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.number,
};
