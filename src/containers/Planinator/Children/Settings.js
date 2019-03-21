import React, { useState } from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import ValidUrl from 'valid-url';
import * as M from '@cjdev/visual-stack/lib/components/Modal';
import { openModal, closeModal } from '@cjdev/visual-stack-redux';
import { SettingsIcon } from '../../../components/Icons';
import { BasicButton } from '../../../components/Button';
import { Spinner } from '../../../components/Spinner';
import { PhaseSelector } from '../components/PhaseSelector';
import { useModalPlanUpdater } from '../useModalPlanUpdater';
import { DeleteFooter } from '../components/DeleteFooter';
import { NotesInput } from '../components/NotesInput';
import { LinkInput } from '../components/LinkInput';
import { DateRangeForm } from '../components/PhaseForms/DateRangeForm';

const id = R.prop('id');
const idsNotEqual = (obj, againstObj) => R.not(R.equals(id(obj), id(againstObj)));

const ChildSettingsModal = ({ child, project, track, closeModal }) => {
  const [phase, setPhase] = useState(child.phase);
  const [notes, setNotes] = useState(child.notes || '');
  const [link, setLink] = useState(child.link || '');

  const getUpdatedPlan = state => {
    const { settings } = state;
    const tracks = R.map(t => {
      if (idsNotEqual(t, track)) return t;
      const projects = R.map(p => {
        if (idsNotEqual(p, project)) return p;
        const children = R.map(c => {
          if (idsNotEqual(c, child)) return c;

          // new child...
          return {
            ...c,
            phase,
            notes,
            link,
          };
        })(p.children);
        return {
          ...p,
          children,
        };
      })(t.projects);
      return {
        ...t,
        projects,
      };
    })(state.tracks);
    return {
      settings,
      tracks,
    };
  };
  const { state, handler } = useModalPlanUpdater(getUpdatedPlan, closeModal);
  const { putApiMeta } = state;
  const { error, loading } = putApiMeta;

  const validLink = link === '' || !!ValidUrl.isWebUri(link);
  const formValid =
    phase !== child.phase || (validLink && link !== child.link) || notes !== child.notes;

  const getPlanWithoutChild = state => {
    const tracks = R.map(t => {
      if (idsNotEqual(t, track)) return t;
      const newProjects = R.map(p => {
        if (idsNotEqual(p, project)) return p;
        return {
          ...p,
          children: R.reject(R.propEq('id', child.id))(p.children),
        };
      })(t.projects);
      return {
        ...t,
        projects: newProjects,
      };
    })(state.tracks);
    return {
      settings: state.settings,
      tracks,
    };
  };

  const { handler: deleteHandler } = useModalPlanUpdater(getPlanWithoutChild, closeModal);

  return (
    <M.Modal onBackgroundClick={closeModal}>
      <M.Dialog>
        <M.Content>
          <M.Header title={`Settings: ${child.name}`} />
          <M.Body>
            <DateRangeForm disabled={true} range={child} />
            <label>Phase</label>
            <PhaseSelector
              phaseFilter={p => R.includes(p.value, ['build', 'launch', 'complete'])}
              onChange={e => setPhase(e ? e.value : null)}
              value={phase}
            />
            <label>Link</label>
            <LinkInput value={link} onChange={e => setLink(e.target.value || '')} />
            <label>Notes</label>
            <NotesInput value={notes} onChange={e => setNotes(e.target.value || '')} />
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
ChildSettingsModal.propTypes = {
  child: PropTypes.object,
  project: PropTypes.object,
  track: PropTypes.object,
  closeModal: PropTypes.func,
};

const SettingsButtonPure = ({ child, project, track, openModal, closeModal, hover, ...props }) => {
  return (
    <span
      css={`
        display: ${hover ? `inline-block` : `none`};
      `}
      onClick={() => openModal(ChildSettingsModal, { track, closeModal, project, child })}
    >
      <SettingsIcon
        css={`
          fill: currentColor;
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
