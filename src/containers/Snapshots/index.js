import React from 'react';
import * as R from 'ramda';
import PT from 'prop-types';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Page, Header, Title } from '../../components/Page/';
import { Panel, PanelTitle } from '../../components/Panel';
import { getCurrentBoard } from '../../state/reducer';
import { getBoardVersions, getBoard } from '../../state/actions';
import { Table, Th, Tr } from '../../components/Table';
import { TitleLink } from '../../components/TitleLink';
import { SpinnerPanel } from '../../components/Spinner';

import { ModalMountPoint } from '@cjdev/visual-stack-redux/lib/components/Modal';
import { SnapshotRow } from './SnapshotRow';

const getVersions = R.view(R.lensPath(['currentBoard', 'boardVersions', 'data']));
const getLoadingBoardVersions = R.view(R.lensPath(['currentBoard', 'boardVersions', 'loading']));

const SnapshotTable = ({ snapshots, boardId }) => {
  const sorted = R.sort(R.descend(R.prop('lastUpdate')))(snapshots);
  return (
    <Table>
      <thead>
        <Tr>
          <Th w="3%" center>
            Row
          </Th>
          <Th>Name</Th>
          <Th right>Relative Time</Th>
          <Th right>Timestamp</Th>
          <Th right>Millis</Th>
          <Th right>Archived</Th>
          <Th right>Actions</Th>
        </Tr>
      </thead>
      <tbody>
        {sorted.map((s, idx) => (
          <SnapshotRow key={s.lastUpdate} rowNum={idx + 1} snapshot={s} boardId={boardId} />
        ))}
      </tbody>
    </Table>
  );
};
SnapshotTable.propTypes = {
  boardId: PT.string.isRequired,
  snapshots: PT.arrayOf(PT.object),
};

class Snapshots extends React.Component {
  static propTypes = {
    currentBoard: PT.shape({}),
    getBoardVersions: PT.func.isRequired,
    getBoard: PT.func.isRequired,
    match: PT.shape({
      params: PT.shape({
        boardId: PT.string.isRequired,
      }),
    }),
  };

  constructor(props) {
    super(props);
    this.boardId = props.match.params.boardId;
    props.getBoardVersions(this.boardId);
    props.getBoard({ boardId: this.boardId, version: 'current' });
  }

  render() {
    const { currentBoard } = this.props;
    const loading = getLoadingBoardVersions(this.props);
    const { isLoaded, processed } = currentBoard;
    if (loading || !isLoaded) {
      return <SpinnerPanel />;
    }
    const snapshots = getVersions(this.props) || [];
    const header = (
      <Header>
        <Helmet title="Snapshots" />
        <Title>
          Board | <TitleLink href={`/board/${this.boardId}`}>{processed.backlogName}</TitleLink> |
          Snapshots
        </Title>
      </Header>
    );

    return (
      <Page header={header}>
        <Panel>
          <PanelTitle>Snapshots</PanelTitle>
          <SnapshotTable snapshots={snapshots} boardId={this.boardId} />
        </Panel>
        <ModalMountPoint />
      </Page>
    );
  }
}

export default withRouter(
  connect(
    state => ({ currentBoard: getCurrentBoard(state) }),
    {
      getBoardVersions,
      getBoard,
    }
  )(Snapshots)
);
