import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import styled from 'styled-components/macro';
import {
  ResponsiveContainer,
  Line,
  LineChart,
  // eslint-disable-next-line
  Tooltip,
  XAxis,
  YAxis,
  Text,
} from 'recharts';
import { Panel, PanelTitle } from '../../components/Panel';
import { format, formatDate } from '../../utils';

const CustomizedLabel = ({ value, stroke, x, y }) => {
  if (value === 0) return null;
  return (
    <Text x={x + 5} y={y - 5} fill={stroke} fontSize={10}>
      {value}
    </Text>
  );
};
CustomizedLabel.propTypes = {
  stroke: PropTypes.string,
  value: PropTypes.any,
  x: PropTypes.number,
  y: PropTypes.number,
};

const TooltipPanel = styled(Panel)`
  font-size: 0.9em;
`;

const CustomTooltip = props => {
  const { active, label, payload } = props;
  if (!active) return null;
  return <TooltipPanel>{`${label}: ${payload && payload[0] ? payload[0].value : 0}`}</TooltipPanel>;
};
CustomTooltip.propTypes = {
  active: PropTypes.bool,
  label: PropTypes.string,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any,
    })
  ),
};

const WeeklyVelocityChart = ({ velocityData }) => {
  const { graphData, naturalVelocity, lookbackWeeks } = velocityData;

  const data = R.pipe(
    R.keys,
    R.map(d => ({
      m: new Date(d).valueOf(),
      x: format(d, 'MM/DD/YY HH:mm:ss'),
      xAxis: formatDate(d),
      y: graphData[d].points,
      label: graphData[d].points,
    })),
    R.sortBy(R.prop('m'))
  )(graphData);
  const velocityStats = `Weekly Velocity: ${naturalVelocity} (${lookbackWeeks} weeks)`;

  return (
    <Panel>
      <PanelTitle>{velocityStats}</PanelTitle>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart fontSize={12} data={data} margin={{ top: 20, right: 20, left: -40, bottom: 2 }}>
          <XAxis dataKey="xAxis" padding={{ left: 5, right: 5 }} />
          <YAxis padding={{ top: 5, bottom: 5 }} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            strokeWidth="1"
            isAnimationActive={false}
            type="monotone"
            dataKey="y"
            stroke="#666"
            label={<CustomizedLabel />}
            dot={{ r: 1 }}
            activeDot={{ r: 1 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Panel>
  );
};
WeeklyVelocityChart.propTypes = {
  velocityData: PropTypes.shape({
    weekly: PropTypes.shape({
      graphData: PropTypes.object,
      naturalVelocity: PropTypes.number,
      lookbackWeeks: PropTypes.number,
    }),
  }).isRequired,
};

export default WeeklyVelocityChart;
