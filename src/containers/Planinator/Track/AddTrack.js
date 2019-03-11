import React, { useState } from 'react';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { openModal, closeModal } from '@cjdev/visual-stack-redux';
import * as M from '@cjdev/visual-stack/lib/components/Modal';
import { BasicButton } from '../../../components/Button';
import { Spinner } from '../../../components/Spinner';
import { uuid } from '../utils';
import { useModalPlanUpdater } from '../useModalPlanUpdater';
import { useFocus } from '../useFocus';
import { BoardSelector } from '../components/BoardSelector';

const AddTrackModal = ({ closeModal }) => {
  const getNewPlan = state => {
    if (!trackName) {
      return null;
    }
    // TODO name uniqueness?
    // TODO order?
    //
    const { settings, tracks } = state;
    return {
      settings,
      tracks: [
        ...tracks,
        {
          id: uuid(),
          name: trackName,
          board,
        },
      ],
    };
  };

  const focusRef = useFocus();
  const [trackName, setTrackName] = useState('');
  const { state, handler } = useModalPlanUpdater(getNewPlan, closeModal);
  const { putApiMeta } = state;
  const { error, loading } = putApiMeta;

  const [board, setBoard] = useState(null);

  return (
    <M.Modal onBackgroundClick={closeModal}>
      <M.Dialog>
        <M.Content>
          <M.Header title="Add Track" />
          <M.Body>
            <label>Name</label>
            <input
              ref={focusRef}
              name="trackName"
              type="text"
              placeholder="Track Name"
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
            <BasicButton
              type="outline-secondary"
              onClick={handler}
              disabled={trackName.length === 0}
            >
              Add
              {loading && (
                <span
                  css={`
                    margin-left: 8px;
                  `}
                >
                  <Spinner />
                </span>
              )}
            </BasicButton>
          </M.Footer>
        </M.Content>
      </M.Dialog>
    </M.Modal>
  );
};
AddTrackModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
};
const AddTrackButtonPure = ({ openModal, closeModal }) => (
  <BasicButton onClick={() => openModal(AddTrackModal, { closeModal })}>Add Track</BasicButton>
);
AddTrackButtonPure.propTypes = {
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func,
};

export const AddTrackButton = connect(
  null,
  { openModal, closeModal }
)(AddTrackButtonPure);
