import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import SyncLink from '../../components/SyncLink';
import { parseQuery } from '../../utils';
import { Panel, PanelTitle } from '../../components/Panel';
import styled from 'styled-components/macro';

const Ul = styled.ul`
  list-style-type: none;
  padding-left: 0px;
`;
const Li = styled.li`
  margin-top: 1.2em;
`;

const BigLink = styled.a`
  border: 1px solid #ccc;
  padding: 5px;
  &:hover {
    background-color: #eee;
  }
`;

const InvalidBoardMessage = ({ processed, velocity, location, onSyncClick, onResetClick }) => {
  console.log({ processed, velocity });
  const query = parseQuery(location.search);
  const { v, vl } = query;

  const addVelocity = num =>
    R.pipe(
      R.assoc('v', num),
      R.toPairs,
      R.map(p => `${p[0]}=${p[1]}`),
      R.join('&')
    )(query);

  return (
    <Panel>
      <PanelTitle>Something went wrong...</PanelTitle>
      <div>
        The error message I got was <code> {processed.error} </code>.
      </div>
      {processed.error === 'Not Found' && (
        <>
          <div>
            This usually means that this board is new to Burninator. If that is the case, click on
            the Full Sync button. Make sure to set your permissions to "public" for the board in
            Jira.
          </div>
          <SyncLink onResetClick={onResetClick} />
        </>
      )}
      {vl === '0' && (
        <p>
          You specified a velocity lookback parameter of 0! That results is a velocity of 0! Try
          another value for the <b>vl</b> query string parameter.
        </p>
      )}
      <Ul>
        {v === '0' && (
          <Li>
            You specified a velocity parameter of 0! That results is a velocity of 0! Try another
            value for the <b>v</b> query string parameter.
          </Li>
        )}
        {velocity <= 0 && (
          <>
            <Li>The velocity is 0</Li>
            <Li>
              It could be that the board exists, but the velocity ( {velocity} ) is invalid. This
              can easily happen on a board with little or no history. Try a positive integer value
              for the <b>v</b> query string parameter? Something like{' '}
              <BigLink href={`${location.pathname}?${addVelocity(1)}`}>{`${
                location.pathname
              }?${addVelocity(1)}`}</BigLink>
              .
            </Li>
          </>
        )}
      </Ul>
    </Panel>
  );
};
InvalidBoardMessage.propTypes = {
  processed: PropTypes.object,
  onResetClick: PropTypes.func.isRequired,
  onSyncClick: PropTypes.func.isRequired,
  location: PropTypes.object,
  velocity: PropTypes.number,
};

export default InvalidBoardMessage;
