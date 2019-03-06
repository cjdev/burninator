import React, { useEffect, useState } from 'react';
import PT from 'prop-types';
import * as R from 'ramda';
import styled from 'styled-components/macro';
import { connect } from 'react-redux';
import { openModal, closeModal } from '@cjdev/visual-stack-redux';
import * as M from '@cjdev/visual-stack/lib/components/Modal';
import { Table, Tr, Td } from '../../components/Table/LegendTable';
import { BasicButton, RenameButton as RawRenameButton } from '../../components/Button';
import { Spinner } from '../../components/Spinner';
import { updateBoardVersion, getBoardVersions } from '../../state/actions';

const Input = styled.input`
  width: 75%;
  padding: 3px 5px;
  margin-right: 5px;
  margin-left: 0;
  font-size: 1em;
  &::placeholder {
    color: #ccc;
  }
`;

const RenameModalPure = ({
  boardId,
  boardVersionUpdate,
  closeModal,
  getBoardVersions,
  snapshot,
  updateBoardVersion,
}) => {
  const { loading, error } = boardVersionUpdate;
  const [name, setName] = useState(snapshot.versionName || '');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (updating && !boardVersionUpdate.loading && R.isNil(boardVersionUpdate.error)) {
      closeModal();
      getBoardVersions(boardId);
      setUpdating(false);
    }
  }, [boardVersionUpdate]);
  return (
    <M.Modal onBackgroundClick={closeModal}>
      <M.Dialog>
        <M.Content>
          <M.Header title="Rename" />
          <M.Body>
            <Table nohover="true">
              <tbody>
                <Tr>
                  <Td v="middle" nowrap>
                    <div>Name</div>
                  </Td>
                </Tr>
                <Tr>
                  <Td v="middle" nowrap>
                    <Input
                      type="text"
                      name="name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </Td>
                </Tr>
              </tbody>
            </Table>
          </M.Body>
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
                  boardId: boardId,
                  version: snapshot.lastUpdate,
                  data: { versionName: name },
                });
              }}
              disabled={R.equals(snapshot.versionName || '', name)}
            >
              Rename
              {loading && <Spinner />}
            </BasicButton>
          </M.Footer>
        </M.Content>
      </M.Dialog>
    </M.Modal>
  );
};
RenameModalPure.propTypes = {
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
const RenameModal = connect(
  state => ({
    boardVersionUpdate: state.burndown.currentBoard.boardData.boardVersionUpdate,
  }),
  { updateBoardVersion, getBoardVersions }
)(RenameModalPure);

const RenameButtonPure = ({ openModal, closeModal, boardId, snapshot }) => (
  <RawRenameButton onClick={() => openModal(RenameModal, { closeModal, boardId, snapshot })} />
);
RenameButtonPure.propTypes = {
  boardId: PT.string.isRequired,
  closeModal: PT.func.isRequired,
  openModal: PT.func.isRequired,
  snapshot: PT.object.isRequired,
};
export const RenameButton = connect(
  null,
  { openModal, closeModal }
)(RenameButtonPure);
