import React, { useReducer } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { dateStringToTs } from '../utils';
import { validDateFormat } from '../../../utils';

export const DateRangeForm = ({ onChange }) => {
  const [state, dispatch] = useReducer(
    (state, action) => {
      let newState;
      switch (action.type) {
        case 'sd':
          newState = {
            ...state,
            startDate: action.payload,
          };
          break;
        case 'ed':
          newState = {
            ...state,
            endDate: action.payload,
          };
          break;
        default:
          return state;
      }
      onChange({
        data: newState,
        isValid: function() {
          return (
            validDateFormat.test(this.data.startDate) && validDateFormat.test(this.data.endDate)
          );
        },
        convert: function() {
          return {
            startDate: dateStringToTs(this.data.startDate),
            endDate: dateStringToTs(this.data.endDate),
          };
        },
      });
      return newState;
    },
    {
      startDate: '',
      endDate: '',
    }
  );

  return (
    <>
      <div
        css={`
          display: flex;
          justify-content: space-between;
        `}
      >
        <div
          css={`
            flex: 1;
            margin-right: 8px;
          `}
        >
          <label>Start Date</label>
          <input
            name="startDate"
            type="text"
            value={state.startDate}
            onChange={e => {
              dispatch({ type: 'sd', payload: e.target.value });
            }}
          />
        </div>
        <div
          css={`
            flex: 1;
            margin-left: 8px;
          `}
        >
          <label>End Date</label>
          <input
            name="endDate"
            type="text"
            value={state.endDate}
            onChange={e => {
              dispatch({ type: 'ed', payload: e.target.value });
            }}
          />
        </div>
      </div>
    </>
  );
};
DateRangeForm.propTypes = {
  onChange: PropTypes.func.isRequired,
};

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
