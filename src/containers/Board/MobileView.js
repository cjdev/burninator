import React from 'react';
import PT from 'prop-types';
import { Mobile } from '../../components/Responsive';
import VersionsTable from '../Legend/VersionsTable';
import BacklogTable from '../Legend/BacklogTable';
import InputOverviewPanel from '../Legend/InputOverviewPanel';
import IterationsPanel from '../Legend/IterationsPanel';
import BurndownV2 from '../../components/BurndownChart/v2';
import WeeklyVelocityChart from '../../components/WeeklyVelocityChart';
import IssueList from '../../components/IssueList';

export const MobileView = ({ boardId, iterationHistory, velocityData, onHistoryClick }) => (
  <Mobile>
    <VersionsTable />
    <BacklogTable boardId={boardId} />
    <InputOverviewPanel boardId={boardId} />
    <IterationsPanel onHistoryClick={onHistoryClick} />
    <BurndownV2 display="versions" title="Releases / Milestones" />
    <BurndownV2 display="issues" title="Issues" />
    <WeeklyVelocityChart velocityData={velocityData} />
    <IssueList />
    {iterationHistory}
  </Mobile>
);
MobileView.propTypes = {
  boardId: PT.string.isRequired,
  iterationHistory: PT.object,
  velocityData: PT.object.isRequired,
  onHistoryClick: PT.func,
};
