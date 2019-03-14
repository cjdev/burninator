import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars

export const TodayMarker = ({ pos }) => (
  <div
    css={`
      position: absolute;
      top: 0;
      left: ${pos - 2}px;
      width: 1px;
      height: 100%;
      border-left: 2px dashed #eee;
      z-index: 9;
    `}
  />
);
TodayMarker.propTypes = {
  pos: PropTypes.number.isRequired,
};
