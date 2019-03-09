import React from 'react';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import * as M from '@cjdev/visual-stack/lib/components/Modal';
import { openModal, closeModal } from '@cjdev/visual-stack-redux';
import { SettingsIcon } from '../../../components/Icons';
import { BasicButton } from '../../../components/Button';
import { Spinner } from '../../../components/Spinner';

const getSettingsForm = projectSettings => {
  switch (projectSettings.phase) {
    case 'launch':
      return {
        body: (
          <div>
            {projectSettings.phase}
            <ul>
              <li>what action can be taken on a launch project?</li>
              <li>rename</li>
              <li>start/end</li>
              <li>delete</li>
              <li>change phase?</li>
            </ul>
          </div>
        ),
        onSave: () => {
          console.log('save');
        },
      };
    case 'assess':
      return {
        body: (
          <div>
            {projectSettings.phase}
            <ul>
              <li>what action can be taken on an assess project?</li>
              <li>rename</li>
              <li>start/end</li>
              <li>delete</li>
              <li>change phase?</li>
            </ul>
          </div>
        ),
        onSave: () => {
          console.log('save');
        },
      };
    case 'design':
      return {
        body: (
          <div>
            {projectSettings.phase}
            <ul>
              <li>what action can be taken on a design project?</li>
              <li>rename</li>
              <li>start/end</li>
              <li>delete</li>
              <li>change phase?</li>
            </ul>
          </div>
        ),
        onSave: () => {
          console.log('save');
        },
      };
    case 'build':
      return {
        body: (
          <div>
            {projectSettings.phase}
            <ul>
              <li>what action can be taken on a build project?</li>
              <li>add/remove versions from the attached board</li>
              <li>rename</li>
              <li>delete</li>
              <li>change phase?</li>
            </ul>
          </div>
        ),
        onSave: () => {
          console.log('save');
        },
      };
    case 'complete':
      return {
        body: (
          <div>
            {projectSettings.phase}
            <ul>
              <li>what action can be taken on a completed project?</li>
              <li>rename</li>
              <li>delete</li>
              <li>change phase?</li>
            </ul>
          </div>
        ),
        onSave: () => {
          console.log('save');
        },
      };
    default:
      throw Error(`Unknown phase:${projectSettings.phase}`);
  }
};

const ProjectSettingsModal = ({ closeModal, projectSettings }) => {
  const error = null;
  const loading = false;
  const form = getSettingsForm(projectSettings);

  return (
    <M.Modal onBackgroundClick={closeModal}>
      <M.Dialog>
        <M.Content>
          <M.Header title={`Settings: ${projectSettings.name}`} />
          <M.Body>{form.body}</M.Body>
          <M.Footer>
            <span>{error}</span>
            <BasicButton type="text" onClick={closeModal}>
              Cancel
            </BasicButton>
            <BasicButton type="outline-secondary" onClick={form.onSave}>
              Save
              {loading && <Spinner />}
            </BasicButton>
          </M.Footer>
        </M.Content>
      </M.Dialog>
    </M.Modal>
  );
};

export const SettingsButtonPure = ({ hover, openModal, closeModal, projectSettings, ...props }) => {
  return (
    <span onClick={() => openModal(ProjectSettingsModal, { closeModal, projectSettings })}>
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

export const SettingsButton = connect(
  null,
  { openModal, closeModal }
)(SettingsButtonPure);
