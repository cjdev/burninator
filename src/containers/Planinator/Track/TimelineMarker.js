import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars

export const TimeMarker = ({ pos, today = false }) => (
  <div
    css={`
      position: absolute;
      top: 0;
      left: ${pos - 2}px;
      width: 1px;
      height: 100%;

      ${today ? `border-left: 2px dashed #eee;` : `border-left: 2px solid #eee;`}
      z-index: 9;
    `}
  />
);
TimeMarker.propTypes = {
  today: PropTypes.bool,
  pos: PropTypes.number.isRequired,
};
