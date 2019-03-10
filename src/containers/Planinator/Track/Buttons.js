import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { ChevronDoubleDownIcon, ChevronDoubleUpIcon } from '../../../components/Icons';

export const UpButton = ({ hover, onClick, active }) => {
  if (!active) {
    return (
      <span>
        <ChevronDoubleUpIcon
          css={`
            margin-top: -3px;
            ${hover ? `fill: #ddd;` : `fill: transparent;`}
          `}
        />
      </span>
    );
  }
  return (
    <span onClick={onClick}>
      <ChevronDoubleUpIcon
        css={`
          margin-top: -3px;
          ${hover ? `fill: #ddd;` : `fill: transparent;`}
          &:hover {
            fill: #585858;
          }
          &:active {
            fill: #333;
          }
        `}
      />
    </span>
  );
};
UpButton.propTypes = {
  active: PropTypes.bool,
  hover: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

export const DownButton = ({ hover, onClick, active }) => {
  if (!active) {
    return (
      <ChevronDoubleDownIcon
        css={`
          margin-top: -3px;
          ${hover ? `fill: #ddd;` : `fill: transparent;`}
        `}
      />
    );
  }
  return (
    <span onClick={onClick}>
      <ChevronDoubleDownIcon
        css={`
          margin-top: -3px;
          ${hover ? `fill: #ddd;` : `fill: transparent;`}
          &:hover {
            fill: #585858;
          }
          &:active {
            fill: #333;
          }
        `}
      />
    </span>
  );
};
DownButton.propTypes = {
  active: PropTypes.bool,
  hover: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};
