import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import * as R from 'ramda';
import * as M from '@cjdev/visual-stack/lib/components/Modal';
import { openModal, closeModal } from '@cjdev/visual-stack-redux';
import { SettingsIcon } from '../../../components/Icons';
import { BasicButton } from '../../../components/Button';
import { Spinner } from '../../../components/Spinner';
import { useModalPlanUpdater } from '../useModalPlanUpdater';
import { isNilOrEmpty } from '../../../utils';
import { PhaseSelector } from '../components/PhaseSelector';
import { getPhaseForm } from '../components/PhaseForms';
import { DeleteFooter } from '../components/DeleteFooter';

const ProjectSettingsModal = ({ closeModal, track, project }) => {
  const getUpdatedPlan = state => {
    const finalPhaseFormData = phaseFormData.convert();
    const newTracks = R.map(t => {
      if (t.id !== track.id) return t;

      const newProjects = R.map(p => {
        if (p.id !== project.id) return p;
        return {
          ...p,
          name: projectName,
          phase,
          ...finalPhaseFormData,
        };
      })(t.projects);

      return {
        ...t,
        projects: newProjects,
      };
    })(state.tracks);
    // const changed = R.not(R.equals(newTracks, state.tracks));
    return {
      settings: state.settings,
      tracks: newTracks,
    };
  };

  const [projectName, setProjectName] = useState(project.name);
  const [phase, setPhase] = useState(project.phase);

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

  const getPlanWithoutProject = state => {
    const tracks = R.map(t => {
      if (t.id !== track.id) return t;
      return {
        ...t,
        projects: R.reject(R.propEq('id', project.id))(t.projects),
      };
    })(state.tracks);
    return {
      settings: state.settings,
      tracks,
    };
  };

  const { handler: deleteHandler } = useModalPlanUpdater(getPlanWithoutProject, closeModal);

  return (
    <M.Modal onBackgroundClick={closeModal}>
      <M.Dialog>
        <M.Content>
          <M.Header title={`Settings: ${project.name}`} />
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
            {PhaseForm && <PhaseForm track={track} project={project} onChange={setPhaseFormData} />}
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
          <DeleteFooter onDelete={deleteHandler} />
        </M.Content>
      </M.Dialog>
    </M.Modal>
  );
};
ProjectSettingsModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  track: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }),
  project: PropTypes.shape({
    name: PropTypes.string,
    phase: PropTypes.string,
  }),
};

export const SettingsButtonPure = ({ hover, openModal, closeModal, project, track, ...props }) => {
  return (
    <span onClick={() => openModal(ProjectSettingsModal, { closeModal, project, track })}>
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
