import React, { useState } from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import * as M from '@cjdev/visual-stack/lib/components/Modal';
import { openModal, closeModal } from '@cjdev/visual-stack-redux';
import { SettingsIcon } from '../../../components/Icons';
import { BasicButton } from '../../../components/Button';
import { Spinner } from '../../../components/Spinner';
import { useModalPlanUpdater } from '../useModalPlanUpdater';
import { DeleteFooter } from '../components/DeleteFooter';
import { BoardSelector } from '../components/BoardSelector';

const TrackSettingsModal = ({ closeModal, track }) => {
  const [trackName, setTrackName] = useState(track.name);

  const getNewPlan = state => {
    if (!trackName) return null;

    const newTracks = R.map(t => {
      if (t.id === track.id) {
        return {
          ...t,
          name: trackName,
          board,
        };
      }
      return t;
    })(state.tracks);
    return {
      ...state,
      tracks: newTracks,
    };
  };
  const { state, handler } = useModalPlanUpdater(getNewPlan, closeModal);
  const { putApiMeta } = state;
  const { error, loading } = putApiMeta;

  const getPlanWithoutTrack = state => ({
    ...state,
    tracks: R.reject(R.propEq('id', track.id))(state.tracks),
  });
  const { handler: deleteHandler } = useModalPlanUpdater(getPlanWithoutTrack, closeModal);

  const [board, setBoard] = useState(track.board || null);

  return (
    <M.Modal onBackgroundClick={closeModal}>
      <M.Dialog>
        <M.Content>
          <M.Header title={`Track: ${track.name}`} />
          <M.Body>
            <label>Track Name</label>
            <input
              name="trackName"
              type="text"
              value={trackName}
              onChange={e => setTrackName(e.target.value)}
            />
            <label>Jira Board</label>
            <BoardSelector onChange={e => setBoard(e ? e.value : null)} value={board} />
          </M.Body>
          <M.Footer>
            <span>{error}</span>
            <BasicButton type="text" onClick={closeModal}>
              Cancel
            </BasicButton>
            <BasicButton type="outline-secondary" onClick={handler}>
              Save
              {loading && <Spinner />}
            </BasicButton>
          </M.Footer>
          <DeleteFooter onDelete={deleteHandler} />
        </M.Content>
      </M.Dialog>
    </M.Modal>
  );
};
TrackSettingsModal.propTypes = {
  track: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
  closeModal: PropTypes.func.isRequired,
};

export const SettingsButtonPure = ({ hover, openModal, closeModal, track, ...props }) => {
  return (
    <span onClick={() => openModal(TrackSettingsModal, { closeModal, track })}>
      <SettingsIcon
        css={`
          margin-top: -3px;
          ${hover ? `fill: #ddd;` : `fill: transparent`}
          &:hover {
            fill: #585858;
          }
          &:active {
            fill: #333;
          }
        `}
        size={1}
        {...props}
      />
    </span>
  );
};
SettingsButtonPure.propTypes = {
  hover: PropTypes.bool,
  track: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func,
};

export const SettingsButton = connect(
  null,
  { openModal, closeModal }
)(SettingsButtonPure);
