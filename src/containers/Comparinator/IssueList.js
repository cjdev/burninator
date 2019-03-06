import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import styled, { css } from 'styled-components/macro';
import { diffDates, formatDate, getJiraIssueLink, mapIndex } from '../../utils';
import { formatVersionTitle2 } from './utils';

import { Panel, PanelTitle, PanelTitleLeft } from '../../components/Panel';
import { Td, Th, Tr, Table } from './Table';

const greenCell = css`
  ${({ theme }) => `
    border-left: ${theme.issueList.green.border};
    background-color: ${theme.issueList.green.bg};
  `};
`;

const redCell = css`
  ${({ theme }) => `
    border-left: ${theme.issueList.red.border};
    background-color: ${theme.issueList.red.bg};
  `};
`;

const Row = styled(Tr)`
  ${props => {
    switch (props.highlight) {
      case 'highlight':
        return `
          font-weight: 600;
          background-color: #F6F6F6 !important;
        `;
      case 'fade':
        return `
          & > td, & a {
            color: #bbb !important;
          }
        `;
      default:
        return '';
    }
  }};
`;

const getReleaseDiff = (pos, prev) => {
  const diff = diffDates(pos.completedWeekPadded, prev.completedWeekPadded);
  if (diff > 0) return 'later';
  if (diff < 0) return 'earlier';
  return 'default';
};

const IndicatingCell = styled(Td)`
  ${({ indicator, theme, description }) => {
    return `
      ${description && `border-top: 0;`}
      color: ${theme.comparinator[indicator].color};
      font-weight: ${theme.comparinator[indicator].weight};
      background: ${theme.comparinator[indicator].bg};
      border-left: ${theme.comparinator[indicator].border};
    `;
  }};
`;

const DataCell = ({ cellData, rowData }) => {
  if (!cellData) return <Td />;

  const p = cellData.position;
  const totalCount = rowData.length;

  const releaseAtPreviousPosition = rowData[p - 1];
  const releaseAtNextPosition = rowData[p + 1];
  const isZeroPosition = p === 0;
  const isFinalPosition = p === totalCount - 1;
  let diff;
  // not final, but next is undefined === DONE
  if (!isFinalPosition && !releaseAtNextPosition) {
    diff = 'done';
  } else if (isZeroPosition) {
    // zero position has no color
    diff = 'zero';
  } else if (!releaseAtPreviousPosition) {
    // not zero, but previous is undefined === NEW
    diff = 'new';
    // [better|worse|same] based on date vs previous
  } else {
    diff = getReleaseDiff(cellData, releaseAtPreviousPosition);
  }
  // console.log('diff: ', diff, isFinalPosition, releaseAtNextPosition);

  return (
    <IndicatingCell key={p} right indicator={diff}>
      {formatDate(cellData.completedWeekPadded)}
    </IndicatingCell>
  );
};
DataCell.propTypes = {
  cellData: PropTypes.shape({}),
  rowData: PropTypes.array,
};

const Version = styled(Td)`
  cursor: pointer;
  ${({ name, last }) => (name ? last && greenCell : redCell)};
`;

const IssueRow = ({ rowNum, issue, versions, onVersionClick, highlight }) => {
  return (
    <Row highlight={highlight}>
      <Td center>{rowNum + 1}</Td>
      <Td>{getJiraIssueLink(issue, 'key')}</Td>
      <Td ellipsis>{issue.last.summary}</Td>
      <Version
        ellipsis
        last={issue.last.isFinalInVersion || undefined}
        name={issue.last.version}
        onClick={() => onVersionClick(issue.last.version)}
      >
        {issue.last.version}
      </Version>
      <Td center>{issue.last.points}</Td>
      {R.map(i => <DataCell key={i} cellData={issue.data[i]} rowData={issue.data} />)(
        R.range(0, versions.length)
      )}
    </Row>
  );
};
IssueRow.propTypes = {
  rowNum: PropTypes.any,
  issue: PropTypes.shape({
    data: PropTypes.array.isRequired,
    last: PropTypes.shape({
      isFinalInVersion: PropTypes.bool,
      points: PropTypes.number,
      summary: PropTypes.string,
      version: PropTypes.any,
    }).isRequired,
  }),
  versions: PropTypes.array,
  onVersionClick: PropTypes.func.isRequired,
  highlight: PropTypes.any,
};

const positionData = (data, length) =>
  R.map(i => R.find(R.propEq('position', i))(data))(R.range(0, length));

class IssueList2 extends React.Component {
  static propTypes = {
    comparinator: PropTypes.shape({
      versions: PropTypes.array.isRequired,
    }),
  };

  constructor() {
    super();
    this.handleVersionClick = this.handleVersionClick.bind(this);
  }

  state = {
    highlightedVersion: null,
  };

  handleVersionClick(e) {
    this.setState(s => ({
      ...s,
      highlightedVersion: s.highlightedVersion === e ? null : e,
    }));
  }

  getHighlight(issue) {
    if (!this.state.highlightedVersion) return '';
    return this.state.highlightedVersion === issue.version ? 'highlight' : 'fade';
  }

  render() {
    const { versions } = this.props.comparinator;
    // console.log('versions: ', comparinatorData, versions);

    // 0 enhance each issue in each version with a position
    // 1 put all the issues from each version into one list
    // 2 group by the issue key
    // 3 place the groups into position?
    // 4 sort each group by the date of the "last" position (+ ordinal)
    /* output:
    [{
      key: 'CJPM-1234',
      latest: {c},
      data: [{b} {a}, {c}]
    },
    {
      key: 'CJPM-7890',
      latest: {c},
      data: [{b} {a}, {c}]

    }]
    */

    const finalIssueList = R.pipe(
      mapIndex((v, idx) => {
        return {
          ...v,
          enhancedIssueList: R.map(R.assoc('position', idx))(v.enhancedIssueList),
        };
      }),
      R.pluck('enhancedIssueList'),
      R.flatten,
      R.groupBy(R.prop('key')),
      R.mapObjIndexed((val, key) => {
        const data = positionData(val, versions.length);
        const last = R.last(R.filter(R.identity)(data));
        // console.log('last.last: ', last.summary, data);
        return {
          data,
          last,
          lastCompletedWeekPadded: last.completedWeekPadded,
          lastOrdinal: last.ordinal,
          key,
        };
      }),
      R.values,
      R.sortWith([
        R.ascend(i => new Date(i.lastCompletedWeekPadded).valueOf()),
        R.ascend(R.prop('lastOrdinal')),
      ])
    )(versions);
    // console.log('finalIssueList: ', finalIssueList);

    return (
      <Panel>
        <PanelTitle>
          <PanelTitleLeft>Issues</PanelTitleLeft>
        </PanelTitle>
        <Table>
          <thead>
            <Tr>
              <Th colSpan={5} />
              {versions.map(v => {
                const title = formatVersionTitle2(v);
                return (
                  <Th ellipsis w={`${30 / versions.length}%`} key={v.boardIx} right>
                    <div>{title.relative.toUpperCase()}</div>
                    <div>{title.timestamp}</div>
                  </Th>
                );
              })}
            </Tr>
            <Tr>
              <Th w="3%" center>
                Row
              </Th>
              <Th w="5%">Key</Th>
              <Th w="45%">Summary</Th>
              <Th w="15%">Release</Th>
              <Th w="2%" center>
                Points
              </Th>
              {versions.map((v, i) => (
                <Th key={i} />
              ))}
            </Tr>
            <Tr />
          </thead>
          <tbody>
            {mapIndex((issue, idx) => (
              <IssueRow
                key={idx}
                rowNum={idx}
                issue={issue}
                onVersionClick={this.handleVersionClick}
                highlight={this.getHighlight(issue.last)}
                versions={versions}
              />
            ))(finalIssueList)}
          </tbody>
        </Table>
      </Panel>
    );
  }
}

export default IssueList2;
