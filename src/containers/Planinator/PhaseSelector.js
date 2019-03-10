import React from 'react';
import ReactSelector from 'react-select';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { phaseOptions, phaseBgMap } from './utils';

const renderPhaseOption = option => {
  const p = phaseBgMap[option.value];
  return (
    <div
      css={`
        display: flex;
        align-items: center;
      `}
    >
      <div
        css={`
          border: 1px solid #999;
          min-height: 1px;
          background: ${p.bg};
          width: 16px;
          height: 16px;
          margin-right: 8px;
          border-radius: 2px;
        `}
      />
      <span>{option.label}</span>
    </div>
  );
};

const Select = styled(ReactSelector)`
  margin-bottom: 0.8rem;
`;

export const PhaseSelector = props => {
  return (
    <Select
      options={phaseOptions}
      optionRenderer={renderPhaseOption}
      valueRenderer={renderPhaseOption}
      {...props}
    />
  );
};
