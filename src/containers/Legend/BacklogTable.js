import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import { connect } from 'react-redux';
import { getCurrentBoard } from '../../state/reducer';
import { getSyncBoard, getResetBoard } from '../../state/actions';

import { Panel, PanelTitle, PanelTitleRight } from '../../components/Panel';
import { Spinner } from '../../components/Spinner';
import BoardStatus from './BoardStatus';
import SnapshotSelector from '../../components/SnapshotSelector';
import { BasicButton } from '../../components/Button';
import './BacklogTable.css';

const Wrapper = styled.div`
  white-space: nowrap;
`;

const Section = styled.div`
  border: 0px solid #eee;
  margin: 1em 0;
`;

const SelectLabel = styled.div`
  margin: 8px;
`;

class BacklogTable extends React.Component {
  static propTypes = {
    boardId: PropTypes.string.isRequired,
    history: PropTypes.object,
    getSyncBoard: PropTypes.func.isRequired,
    getResetBoard: PropTypes.func.isRequired,
    currentBoard: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.handleCompareClick = this.handleCompareClick.bind(this);
    this.handleCompareVersionChange = this.handleCompareVersionChange.bind(this);
    this.handleSync = this.handleSync.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.state = {};
  }

  handleSync = boardId => {
    this.props.getSyncBoard({ boardId });
  };

  handleReset = boardId => {
    this.props.getResetBoard({ boardId }, () => {
      this.props.history.push(`/board/${boardId}`);
    });
  };

  handleVersionChange = (versionId, boardId, history) => {
    history.push(`/board/${boardId}/history/${versionId}`);
  };

  handleCompareClick = (boardId, versionId, compareVersionId) => {
    if (this.state.compareVersionId) {
      this.props.history.push(`/board/${boardId}/comparinator/${versionId}/${compareVersionId}`);
    }
  };

  handleCompareVersionChange = e => {
    this.setState({
      compareVersionId: e.value,
    });
  };

  render() {
    const { boardId, history, currentBoard } = this.props;
    const { boardVersions, processed: board, syncError, status } = currentBoard;
    const { basisDate: lastUpdate } = board;

    const { compareVersionId } = this.state;

    return (
      <Panel>
        <PanelTitle>
          <div>Snapshots</div>
          <PanelTitleRight>
            <Link to={`/board/${boardId}/snapshots`}>Manage</Link>
          </PanelTitleRight>
        </PanelTitle>
        {!boardVersions || !boardVersions.data ? (
          <Spinner />
        ) : (
          <Wrapper>
            <Section>
              <SelectLabel>Version</SelectLabel>
              <div>
                <SnapshotSelector
                  boardVersions={boardVersions}
                  onChange={e => this.handleVersionChange(e.value, boardId, history)}
                  value={lastUpdate}
                />
              </div>
              <BoardStatus
                errorMessage={syncError}
                boardId={boardId}
                status={status}
                onSyncClick={() => this.handleSync(boardId)}
                onResetClick={() => this.handleReset(boardId)}
                lastUpdate={lastUpdate}
              />
            </Section>
            {board.opts.showComparinator && (
              <Section>
                <SelectLabel>Comparinator</SelectLabel>
                <div>
                  <SnapshotSelector
                    boardVersions={boardVersions}
                    disableOptions={[`${lastUpdate}`]}
                    onChange={this.handleCompareVersionChange}
                    value={compareVersionId}
                  />
                </div>
                <BasicButton
                  onClick={e =>
                    this.handleCompareClick(boardId, lastUpdate, this.state.compareVersionId)
                  }
                >
                  Compare
                </BasicButton>
              </Section>
            )}
          </Wrapper>
        )}
      </Panel>
    );
  }
}

// export default withRouter(BacklogTable);
export default withRouter(
  connect(
    state => ({ currentBoard: getCurrentBoard(state) }),
    {
      getResetBoard,
      getSyncBoard,
    }
  )(BacklogTable)
);
