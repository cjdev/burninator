import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import * as M from '@cjdev/visual-stack/lib/components/Modal';
import { openModal, closeModal } from '@cjdev/visual-stack-redux';
import { SettingsIcon } from '../../../components/Icons';
import { BasicButton } from '../../../components/Button';
import { Spinner } from '../../../components/Spinner';
import { putPlan, getPlan } from '../api';
import PlaninatorContext from '../context';

const TrackSettingsModal = ({ closeModal, track }) => {
  const { state, dispatch, planId, version } = useContext(PlaninatorContext);
  const { settings, tracks, putApiMeta } = state;
  const { error, loading } = putApiMeta;

  const [updating, setUpdating] = useState(false);
  useEffect(() => {
    if (updating && !putApiMeta.loading && !putApiMeta.error) {
      closeModal();
      getPlan(planId, version, dispatch);
      setUpdating(false);
    }
  }, [updating, closeModal, putApiMeta, planId, version, dispatch]);

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
                setUpdating(true);
                putPlan(planId, { settings, tracks }, dispatch);
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
