import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro';
import SyncLink from '../../components/SyncLink';
import { getRelativeTime, formatLongDate } from '../../utils';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  & > a {
    color: #2196f3;
  }
  & > svg {
    border-top: 5px solid transparent;
    display: inline-block;
  }
`;

const SyncError = styled.div`
  margin-left: 1em;
  color: red;
`;

const BoardStatus = ({ boardId, onSyncClick, onResetClick, lastUpdate, errorMessage }) => {
  const relativeTime = getRelativeTime(lastUpdate);
  const time = formatLongDate(lastUpdate);

  return (
    <Wrapper>
      <SyncLink
        title={time}
        nonSyncingText={relativeTime}
        onSyncClick={onSyncClick}
        onResetClick={onResetClick}
      />
      <SyncError>{errorMessage}</SyncError>
    </Wrapper>
  );
};

BoardStatus.propTypes = {
  errorMessage: PropTypes.string,
  boardId: PropTypes.string.isRequired,
  onResetClick: PropTypes.func,
  onSyncClick: PropTypes.func,
  lastUpdate: PropTypes.oneOfType([PropTypes.object, PropTypes.number]).isRequired,
};

export default BoardStatus;
