import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
// import { dateStringToTs } from '../utils';
// import { validDateFormat } from '../../../utils';

export const BuildPhaseForm = ({ onChange }) => {
  return (
    <>
      <label>Build: TODO</label>
      <ul>
        <li>select releases from a list populated by the latst associated jira board</li>
      </ul>
    </>
  );
};
BuildPhaseForm.propTypes = {
  onChange: PropTypes.func.isRequired,
};
