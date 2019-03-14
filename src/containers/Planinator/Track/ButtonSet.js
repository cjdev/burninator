import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { SettingsButton } from './Settings';
import { UpButton, DownButton } from './Buttons';
import { AddProjectButton } from './AddProject';

export const ButtonSet = ({ position, totalLength, track, onClickUp, onClickDown }) => {
  const [hover, setHover] = useState(false);
  const activeUpButton = position > 0;
  const activeDownButton = position < totalLength - 1;
  return (
    <span
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      css={`
              padding: 0 8px;
              display: flex:
              align-items: center;
              justify-content: space-around;
                cursor: pointer;
              & > * {
                margin: 0 2px;
              }
 `}
    >
      <AddProjectButton track={track} hover={hover} />
      <DownButton hover={hover} onClick={onClickDown} active={activeDownButton} />
      <UpButton hover={hover} onClick={onClickUp} active={activeUpButton} />
      <SettingsButton track={track} hover={hover} />
    </span>
  );
};
ButtonSet.propTypes = {
  position: PropTypes.number.isRequired,
  totalLength: PropTypes.number.isRequired,
  onClickUp: PropTypes.func.isRequired,
  onClickDown: PropTypes.func.isRequired,
  track: PropTypes.any,
};
