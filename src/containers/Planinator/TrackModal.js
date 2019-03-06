import React, { useState } from 'react';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import * as M from '@cjdev/visual-stack/lib/components/Modal';
import { openModal, closeModal } from '@cjdev/visual-stack-redux';
import { SettingsIcon } from '../../components/Icons';
import { BasicButton } from '../../components/Button';
import { Spinner } from '../../components/Spinner';

const TrackSettingsModal = ({ closeModal, settings, track }) => {
  const error = null;
  const loading = false;

  return (
    <M.Modal onBackgroundClick={closeModal}>
      <M.Dialog>
        <M.Content>
          <M.Header title={`Settings: ${track.name}`} />
          <M.Body>
            <ul>
              <li>add project</li>
              <li>reorder projects</li>
              <li>rename track</li>
              <li>delete track</li>
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
                console.log('save track settings');
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

export const SettingsButtonPure = ({ hover, openModal, closeModal, track, settings, ...props }) => {
  return (
    <span onClick={() => openModal(TrackSettingsModal, { closeModal, settings, track })}>
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

export const SettingsButton = connect(
  null,
  { openModal, closeModal }
)(SettingsButtonPure);
