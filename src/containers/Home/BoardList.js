import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import { distanceInWordsStrict } from 'date-fns';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Table, Tr, Td } from '../../components/Table';
import { Page, Header, Title } from '../../components/Page/';
import { Panel, PanelTitle } from '../../components/Panel';

const sortByBacklogName = R.sortBy(
  R.compose(
    R.toLower,
    R.prop('backlogName')
  )
);

const header = (
  <Header>
    <Helmet title="Boards" />
    <Title>Boards</Title>
  </Header>
);

export const BoardList = ({ boards }) => (
  <Page header={header}>
    <Panel>
      <PanelTitle>Known Boards</PanelTitle>
      <Table>
        <tbody>
          {R.pipe(
            sortByBacklogName,
            R.map(b => (
              <Tr key={b.boardId}>
                <Td right w="5%">
                  <Link to={`/board/${b.boardId}`}>{b.boardId}</Link>
                </Td>
                <Td>
                  <Link to={`/board/${b.boardId}`}>{b.backlogName}</Link>
                </Td>
                <Td right>{distanceInWordsStrict(b.lastUpdate, new Date())}</Td>
              </Tr>
            ))
          )(boards)}
        </tbody>
      </Table>
    </Panel>
  </Page>
);
BoardList.propTypes = {
  boards: PropTypes.arrayOf(
    PropTypes.shape({
      backlogName: PropTypes.string,
      boardId: PropTypes.string,
      lastUpdate: PropTypes.number,
    })
  ).isRequired,
};
