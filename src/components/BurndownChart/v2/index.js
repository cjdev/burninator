import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components/macro';
import * as R from 'ramda';
import {
  ResponsiveContainer,
  ReferenceArea,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  // eslint-disable-next-line
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Panel, PanelTitle, PanelTitleRight } from '../../../components/Panel';
import { updateActiveChartIndex } from '../../../state/actions';
import { getCurrentBoard } from '../../../state/reducer';
import { Desktop } from '../../../components/Responsive';
import { formatDate, mapIndex } from '../../../utils';
import { CustomizedXAxisTick, RefLineLabel } from '../charting';
import { CustomTooltip2 } from './Tooltip';

const CustomVersionLabel = ({ version, viewBox }) => (
  <text x={viewBox.x} y={viewBox.y} dy={-5} dx={2} fill="#333" fontSize={8} textAnchor="start">
    {version}
  </text>
);
CustomVersionLabel.propTypes = {
  stroke: PropTypes.any,
  version: PropTypes.string,
  viewBox: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
};

const Label = styled.label`
  margin: 0;
  display: inline-flex;
  align-items: center;
`;
const CheckboxLabel = styled.span`
  user-select: none;
`;
const CBInput = styled.input`
  input& {
    margin-top: 0;
    margin-bottom: 0;
  }
`;
const TooltipCheckbox = ({ checked, onChange }) => {
  return (
    <Label>
      <CBInput type="checkbox" checked={checked} onChange={onChange} />
      <CheckboxLabel>Tooltips</CheckboxLabel>
    </Label>
  );
};
TooltipCheckbox.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

///////////////////////////////////////////////////////////////////////////

const V2Chart = ({ currentBoard, display, title }) => {
  const [showTooltips, toggleTooltips] = useState(false);

  const handleTooltipToggle = () => {
    toggleTooltips(!showTooltips);
  };

  const {
    enhancedIssueList,
    v2ChartData: { chartData, versionRefLines, outsideVersionRefLines },
    velocityData,
    opts,
  } = currentBoard.processed;

  const override = opts.computedConfig.scopeGrowth.isOverridden || velocityData.overridden;
  const areaColor = override ? 'rgba(244,67,54,0.3)' : 'rgba(76,175,80,.7)';
  const finalTitle = `${title}${override ? ' (overridden)' : ''}`;

  const issuesEndingVersions = R.filter(R.propEq('isFinalInVersion', true))(enhancedIssueList);
  const totalVersionPoints = issuesEndingVersions[0].pointsRemainingAfterMe;
  const displayVersions = display === 'versions';
  const issuesToRender = displayVersions ? issuesEndingVersions : enhancedIssueList;

  const getConePointInside = cw =>
    R.pipe(
      R.filter(R.propEq('completedWeek', cw)),
      R.pluck('pointsRemainingAfterMe'),
      R.sort(R.lt),
      R.take(1),
      R.prop(0)
    );

  const getConePointOutside = cw =>
    R.pipe(
      R.filter(R.propEq('completedWeekPadded', cw)),
      R.pluck('pointsRemainingAfterMe'),
      R.sort(R.lt),
      R.take(1),
      R.prop(0)
    );

  const coneLineData = R.pipe(
    R.map(m => {
      return {
        ...m,
        cw: m.completedWeek,
        conePointInside: getConePointInside(m.completedWeek)(m.versions),
        conePointOutside: getConePointOutside(m.completedWeek)(m.versions),
      };
    })
  )(chartData);
  // console.log('coneLineData: ', coneLineData);

  const lines = mapIndex((i, idx) => {
    const dot = i.completedWeek === i.completedWeekPadded;
    const strokeColor = displayVersions
      ? 'rgba(55,71,79,.5)'
      : i.points > 0 && i.points < 13
      ? 'rgba(55,71,79,.5)' // ok
      : 'rgba(244,67,54,0.3)'; // red
    return (
      <Line
        activeDot={false}
        connectNulls={true}
        dataKey={i.key}
        isAnimationActive={false}
        key={i.key + idx}
        type="linear"
        dot={dot ? { r: 2, fill: 'rgba(88,88,88,.5)' } : false}
        stroke={strokeColor}
        strokeWidth={displayVersions ? 0 : 2}
      />
    );
  })(issuesToRender);

  const areas = R.map(i => {
    const height = Math.min(Math.ceil(totalVersionPoints * 0.02), 7);
    const scaledHeight = height / 4;
    const bottomEdge = Math.max(0, i.pointsRemainingAfterMe - scaledHeight);
    const topEdge = i.pointsRemainingAfterMe + scaledHeight;

    return (
      <ReferenceArea
        x1={formatDate(i.completedWeek)}
        x2={formatDate(i.completedWeekPadded)}
        y1={topEdge}
        y2={bottomEdge}
        key={i.key}
        stroke={areaColor}
        fill={areaColor}
        label={<CustomVersionLabel version={i.version} />}
        Tooltip
      />
    );
  })(issuesEndingVersions);

  return (
    <Panel>
      <PanelTitle>
        <div>{finalTitle}</div>
        <PanelTitleRight>
          <TooltipCheckbox checked={showTooltips} onChange={handleTooltipToggle} />
        </PanelTitleRight>
      </PanelTitle>
      <Desktop>
        {isDesktop => {
          return (
            <ResponsiveContainer width="100%" height={isDesktop ? 600 : 300}>
              <LineChart margin={{ top: 50, right: 25, left: -15, bottom: 40 }} data={chartData}>
                <CartesianGrid stroke="#f0f0f0" vertical={false} horizontal={true} />
                <XAxis dataKey="x" tick={<CustomizedXAxisTick />} />
                <YAxis
                  type="number"
                  domain={[0, `dataMax + ${Math.ceil(totalVersionPoints * 0.1)}`]}
                />
                {showTooltips && (
                  <Tooltip offset={50} content={<CustomTooltip2 issues={enhancedIssueList} />} />
                )}
                {lines}
                {displayVersions && areas}
                {true &&
                  outsideVersionRefLines.map(d => (
                    <ReferenceLine
                      key={`o-${d}`}
                      stroke="rgba(76,175,80,.3)"
                      strokeWidth="1"
                      x={formatDate(d)}
                      label={<RefLineLabel value={formatDate(d)} fill="#666" />}
                    />
                  ))}
                {false &&
                  versionRefLines.map(d => (
                    <ReferenceLine
                      key={d}
                      stroke="rgba(201,201,201,1)"
                      strokeWidth="1"
                      x={formatDate(d)}
                    />
                  ))}
                {false && (
                  <Line
                    type="basis"
                    data={coneLineData}
                    dataKey="conePointInside"
                    connectNulls={true}
                    isAnimationActive={false}
                    dot={false}
                    strokeWidth="2"
                  />
                )}
                {false && (
                  <Line
                    type="basis"
                    data={coneLineData}
                    dataKey="conePointOutside"
                    isAnimationActive={false}
                    connectNulls={true}
                    dot={false}
                    strokeWidth="2"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          );
        }}
      </Desktop>
    </Panel>
  );
};

V2Chart.propTypes = {
  currentBoard: PropTypes.object.isRequired,
  onChartMouseMove: PropTypes.func.isRequired,
  display: PropTypes.string,
  title: PropTypes.string,
};

export default connect(
  state => ({ currentBoard: getCurrentBoard(state) }),
  {
    onChartMouseMove: updateActiveChartIndex,
  }
)(V2Chart);
