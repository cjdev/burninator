import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { dateStringToTs, tsToDateString } from '../../utils';
import { validDateFormat } from '../../../../utils';

const buildOnChangeData = newState => {
  return {
    data: newState,
    isValid: function() {
      return validDateFormat.test(newState.startDate) && validDateFormat.test(newState.endDate);
    },
    convert: function() {
      return {
        startDate: dateStringToTs(newState.startDate),
        endDate: dateStringToTs(newState.endDate),
      };
    },
  };
};

export const DateRangeForm = ({ project, onChange }) => {
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

      onChange(buildOnChangeData(newState));
      return newState;
    },
    {
      startDate: project ? tsToDateString(project.startDate) : '',
      endDate: project ? tsToDateString(project.endDate) : '',
    }
  );

  useEffect(() => {
    if (project) {
      onChange(buildOnChangeData(state));
    }
  }, [project]); // eslint-disable-line react-hooks/exhaustive-deps

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
  project: PropTypes.shape({}),
  onChange: PropTypes.func.isRequired,
};
