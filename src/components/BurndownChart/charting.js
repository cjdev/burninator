import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components/macro';

import { Panel } from '../../components/Panel';
import * as T from '../../components/Table';

export const Table = T.Table;
export const fontSize = css`
  font-size: 0.9em;
`;
export const Tr = styled(T.Tr)`
  ${fontSize};
`;
export const Td = styled(T.Td)`
  ${fontSize};
`;
export const Th = styled(T.Th)`
  ${fontSize};
`;

export const TooltipPanel = styled(Panel)`
  min-width: 200px;
`;

export const TooltipTitle = styled.div`
  font-size: 1.1em;
  font-weight: 600;
  width: 100%;
  border-bottom: 0px solid #ddd;
  margin-bottom: 5px;
`;

export const TooltipSection = styled.div`
  margin-bottom: 10px;
`;
export const TooltipSectionTitle = styled.div`
  font-weight: 600;
`;

export const TooltipSectionIssueRow = ({ issue }) => {
  return (
    <Tr>
      <Td bold>{issue.key}</Td>
      <Td>{issue.summary}</Td>
      <Td right>{issue.points}</Td>
    </Tr>
  );
};
TooltipSectionIssueRow.propTypes = {
  issue: PropTypes.object,
};

export const TooltipSectionItemRow = ({ item }) => {
  return (
    <Tr>
      <Td>{item.name}</Td>
      <Td right w="1px">
        {item.totalPoints}
      </Td>
    </Tr>
  );
};
TooltipSectionItemRow.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string,
    totalPoints: PropTypes.number,
  }),
};

export const CustomizedXAxisTick = props => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={-2} y={0} dy={14} textAnchor="end" fill="#666" transform="rotate(-35)">
        {payload.value}
      </text>
    </g>
  );
};
CustomizedXAxisTick.propTypes = {
  payload: PropTypes.object,
  x: PropTypes.number,
  y: PropTypes.number,
};

export const RefLineLabel = props => {
  const {
    value,
    fill,
    viewBox: { x, y },
  } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={55} y={0} dy={-5} textAnchor="end" fill={fill} transform="rotate(-35)">
        {value}
      </text>
    </g>
  );
};
RefLineLabel.propTypes = {
  fill: PropTypes.string,
  value: PropTypes.string,
  viewBox: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
};
