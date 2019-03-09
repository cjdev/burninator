import React, { useEffect, useState } from 'react';
import PT from 'prop-types';
import * as R from 'ramda';
import { connect } from 'react-redux';
import { openModal, closeModal } from '@cjdev/visual-stack-redux';
import * as M from '@cjdev/visual-stack/lib/components/Modal';
import {
  BasicButton,
  ArchiveButton as RawArchiveButton,
  UnarchiveButton as RawUnarchiveButton,
} from '../../components/Button';
import { Spinner } from '../../components/Spinner';
import { updateBoardVersion, getBoardVersions } from '../../state/actions';
import { toTitleCase } from '../../utils';

const ArchiveModalPure = ({
  boardId,
  boardVersionUpdate,
  closeModal,
  getBoardVersions,
  snapshot,
  updateBoardVersion,
}) => {
  const { loading, error } = boardVersionUpdate;
  const archiveText = snapshot.versionArchive ? 'unarchive' : 'archive';
  const cappedText = toTitleCase(archiveText);

  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (updating && !boardVersionUpdate.loading && R.isNil(boardVersionUpdate.error)) {
      closeModal();
      getBoardVersions(boardId);
      setUpdating(false);
    }
  }, [updating, boardId, closeModal, getBoardVersions, boardVersionUpdate]);

  return (
    <M.Modal onBackgroundClick={closeModal}>
      <M.Dialog>
        <M.Content>
          <M.Header title={cappedText} />
          <M.Body>Are you sure you want to {archiveText} this snapshot?</M.Body>
          <M.Footer>
            <span>{error}</span>
            <BasicButton type="text" onClick={() => closeModal()}>
              Cancel
            </BasicButton>
            <BasicButton
              type="outline-secondary"
              onClick={() => {
                setUpdating(true);
                updateBoardVersion({
                  boardId,
                  version: snapshot.lastUpdate,
                  data: {
                    versionArchive: !snapshot.versionArchive,
                  },
                });
              }}
            >
              {cappedText}
              {loading && <Spinner />}
            </BasicButton>
          </M.Footer>
        </M.Content>
      </M.Dialog>
    </M.Modal>
  );
};
ArchiveModalPure.propTypes = {
  boardVersionUpdate: PT.shape({
    loading: PT.bool.isRequired,
    error: PT.string,
  }),
  closeModal: PT.func.isRequired,
  boardId: PT.string.isRequired,
  snapshot: PT.object.isRequired,
  updateBoardVersion: PT.func.isRequired,
  getBoardVersions: PT.func.isRequired,
};
const ArchiveModal = connect(
  state => ({
    boardVersionUpdate: state.burndown.currentBoard.boardData.boardVersionUpdate,
  }),
  { updateBoardVersion, getBoardVersions }
)(ArchiveModalPure);

const ArchiveButtonPure = ({ openModal, closeModal, boardId, snapshot }) => {
  const Icon = snapshot.versionArchive ? RawUnarchiveButton : RawArchiveButton;
  return <Icon onClick={() => openModal(ArchiveModal, { closeModal, boardId, snapshot })} />;
};
ArchiveButtonPure.propTypes = {
  boardId: PT.string.isRequired,
  closeModal: PT.func.isRequired,
  openModal: PT.func.isRequired,
  snapshot: PT.object.isRequired,
};
export const ArchiveButton = connect(
  null,
  { openModal, closeModal }
)(ArchiveButtonPure);
