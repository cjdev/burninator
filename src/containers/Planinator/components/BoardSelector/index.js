import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro';
import ReactSelector from 'react-select';
import PlaninatorContext from '../../context';

const Select = styled(ReactSelector)`
  margin-bottom: 0.8rem;
`;

export const BoardSelector = props => {
  const { knownBoards } = useContext(PlaninatorContext);
  return <Select options={knownBoards.values} {...props} />;
};
BoardSelector.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.number,
};
