import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro';
import { connect } from 'react-redux';

import { Panel, PanelTitle } from '../../components/Panel';
import { Table, Tr, Th, Td } from '../../components/Table/LegendTable';
import { getRelativeTime, formatLongDate } from '../../utils';
import OpenModalButton from './ConfigurationModal';
import { getCurrentBoard } from '../../state/reducer';

const OverrideRow = styled(Tr)`
  ${({ override, theme }) =>
    override &&
    `background-color: ${theme.danger.bg};
    > * {
       color: ${theme.danger.color};
    }`};
`;

const buildVelocityRows = processed => {
  const velocityData = processed.velocityData;
  const config = velocityData.opts.computedConfig;
  const velocityRows = [
    <OverrideRow key={0}>
      <Th left>Velocity Prediction</Th>
      <Td min="true" nowrap>
        Natural ({config.velocity.lookback.computed} weeks)
      </Td>
      <Td right>{velocityData.naturalVelocity}</Td>
    </OverrideRow>,
  ];

  if (config.velocity.override.isConfigured) {
    velocityRows.push(
      <OverrideRow key={1}>
        <Td />
        <Td min="true">Configured</Td>
        <Td right>{config.velocity.override.configured}</Td>
      </OverrideRow>
    );
  }
  if (config.velocity.override.isOverridden) {
    velocityRows.push(
      <OverrideRow key={2} override={velocityData.overridden}>
        <Td />
        <Td min="true">Override</Td>
        <Td right>{velocityData.finalVelocity}</Td>
      </OverrideRow>
    );
  }
  return velocityRows;
};

const buildScopeGrowthRows = processed => {
  const scopeGrowthConfig = processed.opts.computedConfig.scopeGrowth;
  const showScopeOverrideWarning = scopeGrowthConfig.isOverridden;
  const scopeRows = [
    <OverrideRow key={0}>
      <Th left nowrap>
        Scope Growth Prediction
      </Th>
      <Td min="true">Default</Td>
      <Td right>{scopeGrowthConfig.default}</Td>
    </OverrideRow>,
  ];
  if (scopeGrowthConfig.configured) {
    scopeRows.push(
      <OverrideRow key={1}>
        <Td />
        <Td min="true">Configured</Td>
        <Td right>{scopeGrowthConfig.configured}</Td>
      </OverrideRow>
    );
  }
  if (scopeGrowthConfig.isOverridden) {
    scopeRows.push(
      <OverrideRow key={2} override={showScopeOverrideWarning}>
        <Td />
        <Td min="true">Override</Td>
        <Td right>{scopeGrowthConfig.computed}</Td>
      </OverrideRow>
    );
  }
  return scopeRows;
};

const PairWrapper = styled.span`
  margin-right: 5px;
  padding-right: 7px;
  border-right: 1px solid #ddd;
  &:last-of-type {
    border-right: 0;
    margin-right: 0;
    padding-right: 0;
  }
`;

const StalledConfigPair = ({ index, value }) => (
  <PairWrapper>
    {index}: {value}
  </PairWrapper>
);
StalledConfigPair.propTypes = {
  index: PropTypes.number.isRequired,
  value: PropTypes.any.isRequired,
};

const buildStalledStoryConfigRows = processed => {
  const { stalled = {} } = processed.configuration;

  const stalledString = [1, 2, 3, 5, 8, 13].map(point => (
    <StalledConfigPair key={point} index={point} value={stalled[point] || '--'} />
  ));

  return (
    <Tr>
      <Th>Stalled Story Configuration</Th>
      <Td colSpan={2} right>
        {stalledString}
      </Td>
    </Tr>
  );
};

class InputOverviewPanel extends React.Component {
  static propTypes = {
    currentBoard: PropTypes.object.isRequired,
    boardId: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.intervalId = setInterval(() => {
      this.forceUpdate();
    }, 10000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  render() {
    const { currentBoard, boardId } = this.props;
    const { processed } = currentBoard;

    const lastUpdate = processed.lastUpdate;
    const relativeTime = getRelativeTime(lastUpdate);
    const time = formatLongDate(lastUpdate);

    return (
      <Panel>
        <PanelTitle>Input</PanelTitle>
        <Table nohover="true">
          <tbody>
            <Tr>
              <Th left>Backlog Data</Th>
              <Td colSpan={2} right nowrap min="true">
                <div>{time}</div>
                <div>({relativeTime} old)</div>
              </Td>
            </Tr>
            {buildVelocityRows(processed)}
            {buildScopeGrowthRows(processed)}
            {buildStalledStoryConfigRows(processed)}
          </tbody>
        </Table>
        <OpenModalButton boardId={boardId} takeAction={() => {}} />
      </Panel>
    );
  }
}

export default connect(state => ({ currentBoard: getCurrentBoard(state) }))(InputOverviewPanel);
