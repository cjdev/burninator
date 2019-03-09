import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router-dom';
import { equalsTrue } from '../../utils';
import { Page, Header, Title } from '../../components/Page';
import { SpinnerPanel } from '../../components/Spinner';
import IterationHistory from '../../components/IterationsHistory';
import InvalidBoardMessage from './InvalidBoardMessage';
import { MobileView } from './MobileView';
import { DesktopView } from './DesktopView';
import { BoardHeader } from './Header';
import {
  getBoard,
  getBoardVersions,
  getResetBoard,
  getSyncBoard,
  setUrlOptions,
} from '../../state/actions';
import { getCurrentBoard } from '../../state/reducer';

const Board = ({
  currentBoard: { isLoaded, processed, urlOptions = {} },
  getBoard,
  getBoardVersions,
  getResetBoard,
  getSyncBoard,
  location,
  match,
  setUrlOptions,
}) => {
  const { boardId, versionId: version = 'current' } = match.params;

  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setUrlOptions(location.search);
  }, [location.search, setUrlOptions]);
  useEffect(() => {
    getBoard({ boardId, version });
    getBoardVersions(boardId);
  }, [boardId, getBoard, getBoardVersions, version]);

  if (!isLoaded) {
    return <SpinnerPanel />;
  }
  if (processed.error) {
    return (
      <Page
        header={
          <Header>
            <Title>Error</Title>
            <Helmet title="Error" />
          </Header>
        }
      >
        <InvalidBoardMessage
          processed={processed}
          location={location}
          onSyncClick={() => getSyncBoard({ boardId })}
          onResetClick={() => getResetBoard({ boardId })}
        />
      </Page>
    );
  }

  const { backlogName } = processed.boardData;

  const velocityData = processed.velocityData;

  if (velocityData.configuredVelocity <= 0) {
    return (
      <Page header={<BoardHeader backlogName={backlogName} boardId={boardId} />}>
        <InvalidBoardMessage
          processed={processed}
          velocity={velocityData.configuredVelocity}
          location={location}
          onSyncClick={() => getSyncBoard({ boardId })}
          onResetClick={() => getResetBoard({ boardId })}
        />
      </Page>
    );
  }
  const iterationHistory =
    showHistory || equalsTrue(urlOptions.history) ? <IterationHistory /> : null;

  return (
    <Page header={<BoardHeader backlogName={backlogName} boardId={boardId} />}>
      <DesktopView
        boardId={boardId}
        iterationHistory={iterationHistory}
        velocityData={velocityData}
        onHistoryClick={() => {
          setShowHistory(true);
        }}
      />

      <MobileView
        boardId={boardId}
        iterationHistory={iterationHistory}
        velocityData={velocityData}
        onHistoryClick={() => {
          setShowHistory(true);
        }}
      />
    </Page>
  );
};

Board.propTypes = {
  currentBoard: PropTypes.object,
  getBoardVersions: PropTypes.func.isRequired,
  getBoard: PropTypes.func.isRequired,
  getResetBoard: PropTypes.func.isRequired,
  getSyncBoard: PropTypes.func.isRequired,
  location: PropTypes.object,
  match: PropTypes.object,
  setUrlOptions: PropTypes.func.isRequired,
};

export default withRouter(
  connect(
    state => ({ currentBoard: getCurrentBoard(state) }),
    {
      getBoardVersions,
      getBoard,
      getResetBoard,
      getSyncBoard,
      setUrlOptions,
    }
  )(Board)
);
