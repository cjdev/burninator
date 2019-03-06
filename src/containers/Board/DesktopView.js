import React from 'react';
import PT from 'prop-types';
import styled from 'styled-components/macro';
import { Desktop } from '../../components/Responsive';
import VersionsTable from '../Legend/VersionsTable';
import BacklogTable from '../Legend/BacklogTable';
import InputOverviewPanel from '../Legend/InputOverviewPanel';
import IterationsPanel from '../Legend/IterationsPanel';
import BurndownV2 from '../../components/BurndownChart/v2';
import WeeklyVelocityChart from '../../components/WeeklyVelocityChart';
import IssueList from '../../components/IssueList';

const LayoutGrid = styled.div`
  display: grid;
  grid-gap: 8px;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto;
  grid-template-areas:
    'legend charts charts'
    'issues issues issues'
    'history history history';
`;

const LegendGA = styled.div`
  grid-area: legend;
`;
const ChartsGA = styled.div`
  grid-area: charts;
`;
const IssuesGA = styled.div`
  grid-area: issues;
`;
const HistoryGA = styled.div`
  grid-area: history;
`;

export const DesktopView = ({ boardId, iterationHistory, velocityData, onHistoryClick }) => (
  <Desktop>
    <LayoutGrid>
      <LegendGA>
        <VersionsTable />
        <BacklogTable boardId={boardId} />
        <InputOverviewPanel boardId={boardId} />
        <IterationsPanel onHistoryClick={onHistoryClick} />
      </LegendGA>
      <ChartsGA>
        <BurndownV2 display="versions" title="Releases / Milestones" />
        <BurndownV2 display="issues" title="Issues" />
        <WeeklyVelocityChart velocityData={velocityData} />
      </ChartsGA>
      <IssuesGA>
        <IssueList />
      </IssuesGA>
      <HistoryGA>{iterationHistory}</HistoryGA>
    </LayoutGrid>
  </Desktop>
);
DesktopView.propTypes = {
  boardId: PT.string.isRequired,
  iterationHistory: PT.object,
  velocityData: PT.object.isRequired,
  onHistoryClick: PT.func,
};
