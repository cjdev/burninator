import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Header, Title } from '../../components/Page';
import { getJiraBoardLink } from '../../utils';
import { TitleLink } from '../../components/TitleLink';

export const BoardHeader = ({ backlogName, boardId }) => (
  <Header>
    <Helmet title={backlogName} />
    <Title>
      Board |{' '}
      <TitleLink href={getJiraBoardLink(boardId)} target="_blank" rel="noopener noreferrer">
        {backlogName}
      </TitleLink>
    </Title>
  </Header>
);
BoardHeader.propTypes = {
  backlogName: PropTypes.string.isRequired,
  boardId: PropTypes.string.isRequired,
};
