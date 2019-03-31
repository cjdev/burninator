import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro';
import * as R from 'ramda';

export const PanelTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  line-height: 1.2;
  margin-bottom: 8px;
  text-transform: uppercase;
  & * {
    font-size: inherit;
  }
`;

export const PanelTitleLeft = ({ children = '' }) => {
  const a = R.is(Array, children) ? children : [children];
  const b = a.map(c => c.toUpperCase());
  return <div>{b}</div>;
};
PanelTitleLeft.propTypes = {
  children: PropTypes.node,
};

export const PanelTitleRight = styled.div`
  & * {
    font-size: inherit;
  }
`;

export const Panel = styled.div`
  border: 1px solid #ddd;
  background-color: #fff;
  padding: 8px 8px;
  margin-bottom: 8px;
  border-radius: 2px;
`;

export default Panel;
