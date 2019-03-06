/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import { connect } from 'react-redux';
import styled from 'styled-components/macro';
import { getSyncState } from '../../state/reducer';
import { Spinner } from '../../components/Spinner';
import { BasicButton } from '../../components/Button';

const SyncContainer = styled.span`
  display: flex;
  align-items: center;
`;
const UpdateWrapper = styled.div`
  margin-left: 5px;
  font-size: 1.3em;
  font-variant: all-small-caps;
  overflow: hidden;
`;
const SyncUpdate = ({ update }) => {
  if (!update) return null;
  return <UpdateWrapper>{update.message}</UpdateWrapper>;
};
SyncUpdate.propTypes = {
  update: PropTypes.shape({
    message: PropTypes.string.isRequired,
    ts: PropTypes.number.isRequired,
  }),
};

const FullSyncButtonPure = ({ syncState, onResetClick, buttonLabel = 'Full Sync' }) => {
  const { isSyncing, syncUpdates } = syncState;
  return isSyncing ? (
    <SyncContainer>
      <Spinner />
      <SyncUpdate update={R.last(syncUpdates) || { message: 'Syncing...', ts: Date.now() }} />
    </SyncContainer>
  ) : (
    <BasicButton onClick={onResetClick}>{buttonLabel}</BasicButton>
  );
};
FullSyncButtonPure.propTypes = {
  syncState: PropTypes.shape({
    isSyncing: PropTypes.bool,
    syncUpdates: PropTypes.array.isRequired,
  }),
  onResetClick: PropTypes.func.isRequired,
  buttonLabel: PropTypes.string,
};
export const FullSyncButton = connect(
  state => ({ syncState: getSyncState(state) }),
  null
)(FullSyncButtonPure);

const SyncLink = ({ syncState, onSyncClick, onResetClick, title }) => {
  const { isSyncing, syncUpdates } = syncState;
  const inner = isSyncing ? (
    <SyncContainer>
      <Spinner />
      <SyncUpdate update={R.last(syncUpdates) || { message: 'Syncing...', ts: Date.now() }} />
    </SyncContainer>
  ) : (
    <SyncContainer>
      {onResetClick && (
        <BasicButton
          title="Full sync - re-scan entire Jira backlog, including previous iterations"
          onClick={onResetClick}
        >
          Full Sync
        </BasicButton>
      )}
      {onSyncClick && (
        <BasicButton title="Quick sync - only look for new stuff in Jira" onClick={onSyncClick}>
          Quick Sync
        </BasicButton>
      )}
    </SyncContainer>
  );

  return <span>{inner}</span>;
};
SyncLink.propTypes = {
  nonSyncingText: PropTypes.string,
  onResetClick: PropTypes.func,
  onSyncClick: PropTypes.func,
  title: PropTypes.string,
  syncState: PropTypes.object.isRequired,
};

export default connect(state => ({
  syncState: getSyncState(state),
}))(SyncLink);
