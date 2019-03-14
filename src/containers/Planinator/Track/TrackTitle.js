import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars

export const TrackTitle = ({ children, onClick }) => {
  return (
    <span
      css={`
        display: inline-block;
        display: flex;
        align-items: center;
        margin-right: 4px;
        font-size: inherit;
        cursor: pointer;
      `}
      onClick={onClick}
    >
      {children}
    </span>
  );
};
TrackTitle.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.any,
};
