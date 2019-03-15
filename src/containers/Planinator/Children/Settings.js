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

import { PhaseSelector } from '../components/PhaseSelector';
import { useModalPlanUpdater } from '../useModalPlanUpdater';
import { DeleteFooter } from '../components/DeleteFooter';

const ChildSettingsModal = ({ child, project, track, closeModal }) => {
  const getUpdatedPlan = state => {
    // TODO
    const { settings, tracks } = state;
    return {
      settings,
      tracks,
    };
  };
  const { state, handler } = useModalPlanUpdater(getUpdatedPlan, closeModal);
  const { putApiMeta } = state;
  const { error, loading } = putApiMeta;
  const formValid = false; // TODO

  const getPlanWithoutChild = state => {
    // TODO
    const { settings, tracks } = state;
    return {
      settings,
      tracks,
    };
  };
  const { handler: deleteHandler } = useModalPlanUpdater(getPlanWithoutChild, closeModal);
  const [phase, setPhase] = useState(child.phase);
  return (
    <M.Modal onBackgroundClick={closeModal}>
      <M.Dialog>
        <M.Content>
          <M.Header title={`Settings: ${child.name}`} />
          <M.Body>
            <label>TODO</label>
            <div>Allow change the phase while maintaining the connection to a release</div>

            <label>Phase</label>
            <PhaseSelector
              phaseFilter={p => R.includes(p.value, ['build', 'launch', 'complete'])}
              onChange={e => setPhase(e ? e.value : null)}
              value={phase}
            />
          </M.Body>
          <M.Footer>
            <span>{error}</span>
            <BasicButton type="text" onClick={closeModal}>
              Cancel
            </BasicButton>
            <BasicButton type="outline-secondary" onClick={handler} disabled={!formValid}>
              Save
              {loading && <Spinner />}
            </BasicButton>
          </M.Footer>
          <DeleteFooter buttonText={'TODO'} disabled={true} onDelete={deleteHandler} />
        </M.Content>
      </M.Dialog>
    </M.Modal>
  );
  // <M.Modal>
};
ChildSettingsModal.propTypes = {
  child: PropTypes.object,
  project: PropTypes.object,
  track: PropTypes.object,
  closeModal: PropTypes.func,
};

const SettingsButtonPure = ({ child, project, track, openModal, closeModal, hover, ...props }) => {
  return (
    <span onClick={() => openModal(ChildSettingsModal, { track, closeModal, project, child })}>
      <SettingsIcon
        css={`
          ${hover ? `fill: currentColor;` : `fill: transparent`}
          &:hover {
            fill: #ddd;
          }
          &:active {
            fill: #bbb;
          }
        `}
        size={1}
        {...props}
      />
    </span>
  );
};
SettingsButtonPure.propTypes = {
  child: PropTypes.object,
  hover: PropTypes.bool.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  track: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }),
  project: PropTypes.shape({
    name: PropTypes.string,
    phase: PropTypes.string,
  }),
};

export const SettingsButton = connect(
  null,
  { openModal, closeModal }
)(SettingsButtonPure);
