import React, { useState } from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import { connect } from 'react-redux';
import { Panel, PanelTitle } from '../Panel';
import { IssueListRow } from './IssueListRow';
import { IssueListStack } from './IssueListStack';
import { Table, Th } from '../Table';
import { Desktop, Mobile } from '../../components/Responsive';
import { getCurrentBoard } from '../../state/reducer';
import { toggleIssueException } from '../../state/actions';
import { VersionOverlay } from './VersionOverlay';

const lastIssueInActiveSprint = R.pipe(
  R.filter(R.propEq('inActiveSprint', true)),
  R.last
);
const countIssuesByStatus = R.pipe(
  R.pluck('status'),
  R.groupBy(R.prop('name')),
  R.toPairs,
  R.map(p => ({ status: p[0], count: R.length(p[1]) }))
);

const HeaderRow = () => (
  <tr>
    <Th center>Row</Th>
    <Th>Summary</Th>
    <Th>Status</Th>
    <Th>Epic</Th>
    <Th>Release / Milestone</Th>
    <Th right>Points</Th>
    <Th right>Est</Th>
    <Th right>Outside</Th>
    <Th />
  </tr>
);

const getHighlightedVersionData = version =>
  version
    ? {
        name: version.name,
        issues: version.issues || [],
        totalPoints: version.totalPoints,
        totalPointsLeft: version.totalPointsLeft,
        estDate: version.completedWeek,
        outsideDate: version.completedWeekPadded,
        issuesByStatus: countIssuesByStatus(version.issues),
      }
    : null;

const IssueList = ({ currentBoard, toggleIssueException }) => {
  const [highlightedVersion, setHighlightedVersion] = useState(null);

  const { jiraVersions: allVersions } = currentBoard.processed;
  const { stalled } = currentBoard.processed.opts.computedConfig;
  const openIssues = currentBoard.processed.enhancedIssueList;
  const lastActive = lastIssueInActiveSprint(openIssues);
  const issues = R.map(
    issue => ({
      ...issue,
      isLastActive: lastActive && issue.key === lastActive.key,
    }),
    openIssues
  );

  const highlightedVersionData = getHighlightedVersionData(
    R.find(R.propEq('name', highlightedVersion))(allVersions)
  );

  function handleVersionClick(e) {
    setHighlightedVersion(highlightedVersion === e ? null : e);
  }

  function getHighlight({ version }) {
    if (!highlightedVersion) return '';
    return highlightedVersion === version ? 'highlight' : 'fade';
  }

  return (
    <Panel>
      <Desktop>
        {highlightedVersion && <VersionOverlay versionData={highlightedVersionData} />}
        <PanelTitle>Open Issues</PanelTitle>
        <Table>
          <thead>
            <HeaderRow />
          </thead>
          <tbody>
            {issues.map((issue, i) => (
              <IssueListRow
                key={i}
                ordinal={i + 1}
                issue={issue}
                onVersionClick={handleVersionClick}
                onToggleException={toggleIssueException}
                highlight={getHighlight(issue)}
                stalledConfig={stalled}
              />
            ))}
          </tbody>
          <tfoot>
            <HeaderRow />
          </tfoot>
        </Table>
      </Desktop>
      <Mobile>
        <PanelTitle>Open Issues</PanelTitle>
        {issues.map((issue, i) => (
          <IssueListStack key={i} ordinal={i + 1} issue={issue} />
        ))}
      </Mobile>
    </Panel>
  );
};

IssueList.propTypes = {
  toggleIssueException: PropTypes.func.isRequired,
  currentBoard: PropTypes.shape({
    processed: PropTypes.shape({
      enhancedIssueList: PropTypes.arrayOf(
        PropTypes.shape({
          isActiveSprint: PropTypes.bool,
          key: PropTypes.string.isRequired,
        })
      ).isRequired,
    }),
  }),
};

export default connect(
  state => ({ currentBoard: getCurrentBoard(state) }),
  { toggleIssueException }
)(IssueList);
