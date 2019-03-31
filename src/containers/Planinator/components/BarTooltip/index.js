import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { Tooltip } from '../../../../components/Tooltips';
import { tsToDateString } from '../../utils';

const Title = ({ children }) => (
  <div
    css={`
      font-size: 1.1em;
      font-weight: 600;
    `}
  >
    {children}
  </div>
);

export const BoardTooltip = ({ data, age, ...rest }) => (
  <Tooltip effect="solid" id={data.id} {...rest}>
    <div
      css={`
        line-height: 1.5em;
      `}
    >
      <Title>{data.backlogName}</Title>
      <div>Board is {age} days old</div>
    </div>
  </Tooltip>
);

export const BarTooltip = ({ data, ...rest }) => {
  return (
    <Tooltip effect="solid" id={data.id} {...rest}>
      <div
        css={`
          line-height: 1.5em;
        `}
      >
        <Title>{data.name}</Title>
        <div
          css={`
            font-style: italic;
            font-size: 0.9em;
          `}
        >
          {`${tsToDateString(data.startDate)} - ${tsToDateString(data.endDate)}`}
        </div>
        <div>{data.notes}</div>
      </div>
    </Tooltip>
  );
};
BarTooltip.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    startDate: PropTypes.oneOfType([PropTypes.number, PropTypes.object]).isRequired,
    endDate: PropTypes.oneOfType([PropTypes.number, PropTypes.object]).isRequired,
    notes: PropTypes.string,
  }),
};
