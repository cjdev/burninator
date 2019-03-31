import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import { withRouter } from 'react-router-dom';
import ReactSelector from 'react-select';
import { connect } from 'react-redux';
import styled from 'styled-components/macro';

import { getBoard, getBoardVersions } from '../../state/actions';
import { getCurrentBoard } from '../../state/reducer';
import { Panel, PanelTitle, PanelTitleLeft } from '../../components/Panel';
import { Td, Th, Tr, Table } from './Table';
import { diffDates, formatDate, getBurnieBoardVersionLink } from '../../utils';
import { formatVersionTitle2 } from './utils';
import SnapshotSelector from '../../components/SnapshotSelector';
import { ExpandCollapseButton, CloseButton } from '../../components/Button';
import { mapIndex } from '../../utils';

const Controls = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const SnapshotWrapper = styled.div`
  min-width: 250px;
  font-variant: initial;
  font-weight: 400;
  font-size: 0.8rem;
`;

const ConfigWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  &:hover > svg {
    fill: #ccc;
  }
`;

const Select = styled(ReactSelector)`
  min-width: 100px;
  margin: 5px;
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
      border-top-color: transparent !important;
      ${description && `border-top: 0 !important;`}
      color: ${theme.comparinator[indicator].color};
      font-weight: ${theme.comparinator[indicator].weight};
      background: ${theme.comparinator[indicator].bg};
      border-left: ${theme.comparinator[indicator].border};
    `;
  }};
`;

const ConfigCell = ({ v }) => {
  const { scopeGrowth } = v.opts.computedConfig;
  const { finalVelocity } = v.velocityData;
  return (
    <span>
      <span>Velocity: {finalVelocity}</span> <span>Scope: {scopeGrowth.computed}</span>
    </span>
  );
};
ConfigCell.propTypes = {
  v: PropTypes.shape({
    opts: PropTypes.shape({
      computedConfig: PropTypes.shape({
        scopeGrowth: PropTypes.shape({
          computed: PropTypes.number,
        }),
      }),
    }),
    velocityData: PropTypes.shape({
      finalVelocity: PropTypes.number,
    }),
  }),
};

const getDiffIndicator = (
  cellData,
  isFinalPosition,
  isZeroPosition,
  releaseAtNextPosition,
  releaseAtPreviousPosition
) => {
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
  return diff;
};

const DataCell = ({ cellData, rowData, getContent, description, totalCount }) => {
  if (!cellData) return <Td topline={description ? 'off' : ''} />;

  const pos = cellData.position;

  const diff = getDiffIndicator(
    cellData,
    pos === totalCount - 1,
    pos === 0,
    rowData[pos + 1],
    rowData[pos - 1] //releaseAtPreviousPosition
  );

  const content = description ? getContent() : <span>{getContent()}</span>;

  return (
    <IndicatingCell key={pos} right indicator={diff} description={description}>
      {content}
    </IndicatingCell>
  );
};
DataCell.propTypes = {
  cellData: PropTypes.any,
  rowData: PropTypes.array.isRequired,
  getContent: PropTypes.func.isRequired,
  description: PropTypes.bool,
  totalCount: PropTypes.number.isRequired,
};

const ToggledRowNum = styled.span`
  cursor: pointer;
  padding: 0 1em;
  &:hover {
    background-color: #eee;
    color: inherit;
  }
`;

const ReleaseRow = ({ rowNum, release, versions, expanded, onExpandToggle }) => {
  return (
    <Tr borderHover>
      <Td center>
        <ToggledRowNum expanded={expanded} onClick={() => onExpandToggle(rowNum)}>
          {rowNum + 1}
        </ToggledRowNum>
      </Td>
      <Td>{release.lastVersion.name || '(No Release)'}</Td>
      {mapIndex((d, idx) => (
        <DataCell
          key={idx}
          cellData={d}
          rowData={release.dataByPosition}
          totalCount={versions.length}
          getContent={() => formatDate(d.completedWeekPadded)}
        />
      ))(release.dataByPosition)}
    </Tr>
  );
};
ReleaseRow.propTypes = {
  rowNum: PropTypes.number.isRequired,
  release: PropTypes.shape({
    lastVersion: PropTypes.shape({
      name: PropTypes.string,
    }),
  }),
  versions: PropTypes.array.isRequired,
  expanded: PropTypes.bool,
  onExpandToggle: PropTypes.func,
};

const Description = styled.span`
  display: inline-block;
  padding: 0.5em 0.5em 0.5em 0;
`;

const DescriptionDataCell = props => <DataCell {...props} description={true} />;

const DescriptionText = styled(Description)`
  font-style: italic;
`;

const countZeroEstimateIssues = issues => {
  return R.filter(R.propEq('points', 0))(issues).length;
};

const BorderlessTd = styled(Td)`
  border-color: transparent !important;
`;

const buildContent = d => {
  const zeroStories = countZeroEstimateIssues(d.issues);
  const zeroData = zeroStories > 0 ? `(${zeroStories})` : null;
  return (
    <Table>
      <tbody>
        <Tr>
          <BorderlessTd>TTTTotal Points</BorderlessTd>
          <BorderlessTd right>{d.totalPoints}</BorderlessTd>
        </Tr>
        <Tr>
          <BorderlessTd>Total Points Remaining</BorderlessTd>
          <BorderlessTd right>{d.totalPointsLeft}</BorderlessTd>
        </Tr>
        <Tr>
          <BorderlessTd>Stories</BorderlessTd>
          <BorderlessTd right>
            {d.issues.length} {zeroData}
          </BorderlessTd>
        </Tr>
      </tbody>
    </Table>
  );
};

const DescriptionRow = ({ release, versions }) => {
  if (!release) return null;
  const { dataByPosition } = release;
  const description = release.lastVersion.description;
  return (
    <Tr>
      <Td topline="off" />
      <Td normal topline="off">
        <DescriptionText>{description}</DescriptionText>
      </Td>
      {mapIndex((d, i) => (
        <DescriptionDataCell
          key={i}
          cellData={d}
          rowData={dataByPosition}
          totalCount={versions.length}
          getContent={() => buildContent(d)}
          getContent2={() =>
            `${d.issues.length}/${d.totalPoints}/${countZeroEstimateIssues(d.issues)}`
          }
        />
      ))(dataByPosition)}
    </Tr>
  );
};
DescriptionRow.propTypes = {
  release: PropTypes.shape({
    dataByPosition: PropTypes.array,
    lastVersion: PropTypes.shape({
      description: PropTypes.string,
    }),
  }).isRequired,
  versions: PropTypes.array.isRequired,
};

const Switches = ({ onChange, values, initialData }) => {
  const { releaseCount } = initialData;
  const countOptions = R.concat(
    [{ value: 'all', label: 'All', className: 'count-option' }],
    R.map(i => ({ value: i, label: i, className: 'count-option' }))(R.range(1, releaseCount + 1))
  );

  return (
    <Select
      optionClassName="select-option"
      placeholder="Cutoff..."
      searchable={false}
      clearable={false}
      options={countOptions}
      onChange={e => onChange('count', e.value)}
      value={values.count}
    />
  );
};
Switches.propTypes = {
  onChange: PropTypes.func.isRequired,
  values: PropTypes.shape({
    count: PropTypes.number,
  }).isRequired,
  initialData: PropTypes.shape({
    releaseCount: PropTypes.number.isRequired,
  }),
};

const DescriptionToggle = styled.span`
  ${({ on }) => on && `background-color: #585858; color: #fff`};
  user-select: none;
  cursor: pointer;
  padding: 0 3px;
  &:hover {
    background-color: #8a8a8a;
    color: #fff;
  }
`;

const RowToggle = ({ state, onClick }) => (
  <DescriptionToggle on={state} onClick={onClick}>
    Row
  </DescriptionToggle>
);
RowToggle.propTypes = {
  state: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

const VersionHeaderWrapper = styled(Th)`
  border-left: 1px solid #ddd;
  vertical-align: bottom;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;
const VersionHeader = ({ w, v, title, boardDates, removeVersion }) => {
  return (
    <VersionHeaderWrapper w={w} right>
      <TopRow>
        <div
          css={`
            margin-right: 4px;
            & > * {
              display: block;
            }
          `}
        >
          <a href={getBurnieBoardVersionLink(v)}>{title.toUpperCase()}</a>
          <span>{boardDates.timestamp}</span>
        </div>
        <div>
          <CloseButton
            onClick={() => {
              removeVersion(v);
            }}
          />
        </div>
      </TopRow>
    </VersionHeaderWrapper>
  );
};
VersionHeader.propTypes = {
  v: PropTypes.object,
  w: PropTypes.string.isRequired,
  removeVersion: PropTypes.func.isRequired,
  boardDates: PropTypes.shape({
    timestamp: PropTypes.string,
  }).isRequired,
  title: PropTypes.string.isRequired,
};

class VersionList2 extends React.Component {
  static propTypes = {
    getBoard: PropTypes.func.isRequired,
    getBoardVersions: PropTypes.func.isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        boardId: PropTypes.string.isRequired,
      }),
    }),
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    comparinator: PropTypes.shape({
      comparinatorData: PropTypes.array,
      versions: PropTypes.array,
    }),
    comparinatorData: PropTypes.array,
    currentBoard: PropTypes.object.isRequired,
  };
  constructor(props) {
    super(props);
    this.boardId = props.match.params.boardId;
    this.addVersion = this.addVersion.bind(this);
    this.removeVersion = this.removeVersion.bind(this);
    this.handleExpandToggle = this.handleExpandToggle.bind(this);
    this.state = {
      expandedRownums: [],
      switches: {
        descriptions: false,
        count: props.comparinatorData && props.comparinatorData.length,
      },
    };

    this.props.getBoard({ boardId: this.boardId, version: 'current' });
    this.props.getBoardVersions(this.boardId);
  }

  addVersion = e => {
    const { location, history } = this.props;
    history.push(`${location.pathname}/${e.value}${location.search}`);
  };

  removeVersion = version => {
    const { location, history } = this.props;
    const m = location.pathname.match(/board\/(\d+)\/comparinator\/(.*)/);
    const boardId = m[1];
    const newPath = R.pipe(
      R.prop(2),
      R.split('/'),
      R.reject(v => v === version.basisDate.toString()),
      R.join('/')
    )(m);
    history.push(`/board/${boardId}/comparinator/${newPath}${location.search}`);
  };

  handleSwitch = (e, value) => {
    const actions = {
      descriptions: s => R.not(s),
      count: (s, v) => {
        const parsed = parseInt(v, 10);

        if (R.is(Number, parsed) && !isNaN(parsed)) return v;
        return undefined;
      },
    };

    this.setState(state => {
      return {
        ...state,
        switches: {
          ...state.switches,
          [e]: actions[e](state.switches[e], value),
        },
      };
    });
  };

  handleExpandToggle = rowNum => {
    // console.log('handleExpandToggle rowNum: ', rowNum);

    this.setState(state => {
      const { expandedRownums } = state;
      const newExpanded = R.contains(rowNum, expandedRownums)
        ? R.reject(R.equals(rowNum), expandedRownums)
        : R.append(rowNum, expandedRownums);

      return {
        ...state,
        expandedRownums: newExpanded,
      };
    });
  };

  render() {
    const { currentBoard, comparinator } = this.props;
    const { comparinatorData, versions } = comparinator;
    const {
      switches: { count, descriptions },
    } = this.state;
    const releases = count ? comparinatorData.slice(0, count) : comparinatorData;
    const versionIds = R.map(v => v.basisDate.toString())(versions);
    return (
      <Panel>
        <PanelTitle>
          <PanelTitleLeft>Releases and Milestones</PanelTitleLeft>
        </PanelTitle>
        <Controls>
          <Switches
            onChange={this.handleSwitch}
            values={this.state.switches}
            initialData={{ releaseCount: comparinatorData.length }}
          />
          <SnapshotWrapper>
            <SnapshotSelector
              placeholder="Add version..."
              disableOptions={versionIds}
              boardVersions={currentBoard.boardVersions}
              onChange={this.addVersion}
            />
          </SnapshotWrapper>
        </Controls>
        <Table fixed>
          <thead>
            <Tr>
              <Th w="3%" center />
              <Th w="35%" />
              {versions.map(v => {
                const boardDates = formatVersionTitle2(v);
                const title = v.boardData.versionName || boardDates.relative;
                return (
                  <VersionHeader
                    title={title}
                    removeVersion={this.removeVersion}
                    v={v}
                    boardDates={boardDates}
                    w={`${41 / versions.length}%`}
                    key={v.boardIx}
                    right
                  />
                );
              })}
            </Tr>
            <Tr>
              <Th center w="1%">
                <ExpandCollapseButton onClick={() => this.handleSwitch('descriptions')} />
              </Th>
              <Th w="100%" noselect>
                Release Details
              </Th>
              {versions.map(v => (
                <Th ellipsis key={v.boardIx} right>
                  <ConfigWrapper>
                    <ConfigCell v={v} />
                  </ConfigWrapper>
                </Th>
              ))}
            </Tr>
          </thead>
          <tbody>
            {releases.map((release, i) => {
              const expanded = descriptions || R.contains(i, this.state.expandedRownums);
              return (
                <React.Fragment key={i}>
                  <ReleaseRow
                    rowNum={i}
                    release={release}
                    versions={versions}
                    expanded={expanded}
                    onExpandToggle={this.handleExpandToggle}
                  />
                  {expanded && <DescriptionRow release={release} versions={versions} />}
                </React.Fragment>
              );
            })}
          </tbody>
        </Table>
      </Panel>
    );
  }
}

export default withRouter(
  connect(
    state => ({ currentBoard: getCurrentBoard(state) }),
    { getBoardVersions, getBoard }
  )(VersionList2)
);
