import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import * as R from 'ramda';
import { connect } from 'react-redux';
import * as M from '@cjdev/visual-stack/lib/components/Modal';
import { openModal, closeModal } from '@cjdev/visual-stack-redux';
import { PlaylistPlusIcon } from '../../../components/Icons';
import { BasicButton } from '../../../components/Button';
import { Spinner } from '../../../components/Spinner';
import { useModalPlanUpdater } from '../useModalPlanUpdater';
import { uuid } from '../utils';
import { isNilOrEmpty } from '../../../utils';
import { PhaseSelector } from '../components/PhaseSelector';
import { getPhaseForm } from '../components/PhaseForms';

const AddProjectModal = ({ closeModal, track }) => {
  const getUpdatedPlan = state => {
    const finalPhaseFormData = phaseFormData.convert();
    const newTracks = R.map(t => {
      if (t.id !== track.id) {
        return t;
      }
      const projects = t.projects || [];
      const newProjects = [
        ...projects,
        {
          id: uuid(),
          name: projectName,
          phase,
          ...finalPhaseFormData,
        },
      ];
      return {
        ...t,
        projects: newProjects,
      };
    })(state.tracks);
    return {
      settings: state.settings,
      tracks: newTracks,
    };
  };
  const [projectName, setProjectName] = useState('');
  const [phase, setPhase] = useState(null);

  const { state, handler } = useModalPlanUpdater(getUpdatedPlan, closeModal);
  const { putApiMeta } = state;
  const { error, loading } = putApiMeta;

  const PhaseForm = useMemo(() => getPhaseForm(phase), [phase]);
  const [phaseFormData, setPhaseFormData] = useState({ data: null });

  const formValid = !(
    isNilOrEmpty(projectName) ||
    phase === null ||
    phaseFormData.data === null ||
    (phaseFormData.isValid && !phaseFormData.isValid())
  );

  return (
    <M.Modal onBackgroundClick={closeModal}>
      <M.Dialog>
        <M.Content>
          <M.Header title="Add Project" />
          <M.Body>
            <label>Project Name</label>
            <input
              name="projectName"
              type="text"
              placeholder="Project Name"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
            />
            <label>Phase</label>
            <PhaseSelector onChange={e => setPhase(e ? e.value : null)} value={phase} />
            {PhaseForm && <PhaseForm onChange={setPhaseFormData} />}
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
        </M.Content>
      </M.Dialog>
    </M.Modal>
  );
};
AddProjectModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  track: PropTypes.object,
};

export const AddProjectButtonPure = ({ hover, track, openModal, closeModal, ...props }) => {
  return (
    <span onClick={() => openModal(AddProjectModal, { closeModal, track })}>
      <PlaylistPlusIcon
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
        {...props}
      />
    </span>
  );
};
AddProjectButtonPure.propTypes = {
  hover: PropTypes.bool,
  track: PropTypes.object,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func,
};

export const AddProjectButton = connect(
  null,
  { openModal, closeModal }
)(AddProjectButtonPure);
