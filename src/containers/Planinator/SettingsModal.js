import React, { useState, useContext } from 'react';
import styled from 'styled-components/macro';
import { connect } from 'react-redux';
import { openModal, closeModal } from '@cjdev/visual-stack-redux';
import * as M from '@cjdev/visual-stack/lib/components/Modal';
import { BasicButton } from '../../components/Button';
import { Spinner } from '../../components/Spinner';
import { savePlanSettings, getPlan } from './api';
import { PlaninatorDispatch } from './';

const FormContainer = styled.div``;

// const initialState = {};
// const localReducer = (state, action) => {
//   return initialState;
// };

const SettingsModal = ({ closeModal, settings }) => {
  const dispatch = useContext(PlaninatorDispatch);

  const error = null;
  const loading = false;

  // const [localState, localDispatch] = useReducer(localReducer, initialState);
  const [start, setStart] = useState(settings.startDate || '');
  const [end, setEnd] = useState(settings.endDate || '');

  return (
    <M.Modal onBackgroundClick={closeModal}>
      <M.Dialog>
        <M.Content>
          <M.Header title="Settings" />
          <M.Body>
            <FormContainer>
              <label>Start Date</label>
              <input
                name="startDate"
                type="text"
                placeholder="yyyy-mm-dd"
                value={start}
                onChange={e => setStart(e.target.value)}
              />
              <label>End Date</label>
              <input
                name="endDate"
                type="text"
                placeholder="yyyy-mm-dd"
                value={end}
                onChange={e => setEnd(e.target.value)}
              />
            </FormContainer>
            <ul>
              <li>rename?</li>
              <li>save a version</li>
              <li>choose a saved version</li>
            </ul>
          </M.Body>
          <M.Footer>
            <span>{error}</span>
            <BasicButton type="text" onClick={closeModal}>
              Cancel
            </BasicButton>
            <BasicButton
              type="outline-secondary"
              onClick={() => {
                console.log('Save', start, end);
              }}
            >
              Save
              {loading && <Spinner />}
            </BasicButton>
          </M.Footer>
        </M.Content>
      </M.Dialog>
    </M.Modal>
  );
};

const SettingsButtonPure = ({ name = 'Settings', openModal, closeModal, state }) => (
  <BasicButton onClick={() => openModal(SettingsModal, { closeModal, settings: state.settings })}>
    {name}
  </BasicButton>
);

export const SettingsButton = connect(
  null,
  { openModal, closeModal }
)(SettingsButtonPure);
