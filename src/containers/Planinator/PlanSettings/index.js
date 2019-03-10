import React, { useState, useContext, useEffect } from 'react';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { openModal, closeModal } from '@cjdev/visual-stack-redux';
import * as M from '@cjdev/visual-stack/lib/components/Modal';
import { BasicButton } from '../../../components/Button';
import { Spinner } from '../../../components/Spinner';
import { putPlan, getPlan } from '../api';
import PlaninatorContext from '../context';
import { tsToDateString, dateStringToTs, dateFormat } from '../utils';

const SettingsModal = ({ closeModal }) => {
  const { state, dispatch, planId, version } = useContext(PlaninatorContext);
  const { settings, tracks, putApiMeta } = state;
  const { error, loading } = putApiMeta;

  const [updating, setUpdating] = useState(false);

  const [start, setStart] = useState(settings.startDate ? tsToDateString(settings.startDate) : '');
  const [end, setEnd] = useState(settings.endDate ? tsToDateString(settings.endDate) : '');
  const [planName, setPlanName] = useState(settings.name || '');

  useEffect(() => {
    if (updating && !putApiMeta.loading && !putApiMeta.error) {
      closeModal();
      getPlan(planId, version, dispatch);
      setUpdating(false);
    }
  }, [updating, closeModal, putApiMeta, planId, version, dispatch]);

  const handleSave = () => {
    setUpdating(true);
    const newPlan = {
      tracks,
      settings: {
        ...settings,
        endDate: dateStringToTs(end),
        startDate: dateStringToTs(start),
        name: planName,
      },
    };
    putPlan(planId, newPlan, dispatch);
  };

  return (
    <M.Modal onBackgroundClick={closeModal}>
      <M.Dialog>
        <M.Content>
          <M.Header title="Settings" />
          <M.Body>
            <div>
              <label>Name</label>
              <input
                name="planName"
                type="text"
                placeholder="Plan Name"
                value={planName}
                onChange={e => setPlanName(e.target.value)}
              />

              <label>Start Date</label>
              <input
                name="startDate"
                type="text"
                placeholder={dateFormat}
                value={start}
                onChange={e => setStart(e.target.value)}
              />
              <label>End Date</label>
              <input
                name="endDate"
                type="text"
                placeholder={dateFormat}
                value={end}
                onChange={e => setEnd(e.target.value)}
              />
              <label>To Do</label>
              <ul>
                <li>save a version</li>
                <li>choose a saved version</li>
                <li>create a new track</li>
              </ul>
            </div>
          </M.Body>
          <M.Footer>
            <span>{error}</span>
            <BasicButton type="text" onClick={closeModal}>
              Cancel
            </BasicButton>
            <BasicButton type="outline-secondary" onClick={handleSave}>
              Save
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
SettingsModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
};

const SettingsButtonPure = ({ name = 'Settings', openModal, closeModal }) => (
  <BasicButton onClick={() => openModal(SettingsModal, { closeModal })}>{name}</BasicButton>
);
SettingsButtonPure.propTypes = {
  name: PropTypes.string,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func,
};

export const SettingsButton = connect(
  null,
  { openModal, closeModal }
)(SettingsButtonPure);
