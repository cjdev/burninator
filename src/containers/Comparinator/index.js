import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import styled from 'styled-components/macro';
import Flexbox from 'flexbox-react';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { SpinnerPanel } from '../../components/Spinner';
import { Page, Header, Title } from '../../components/Page/';
import { getCompareVersions } from '../../state/actions';
import { getComparinator } from '../../state/reducer';
import VersionList from './VersionList';
import IssueList from './IssueList';
import { getJiraBoardLink } from '../../utils';

const BoardLink = styled.a`
  font-size: 1em;
  &:hover {
    text-decoration: none;
  }
`;

class Comparinator extends React.Component {
  static propTypes = {
    getCompareVersions: PropTypes.func.isRequired,
    location: PropTypes.shape({
      search: PropTypes.string.isRequired,
    }),
    match: PropTypes.shape({
      params: PropTypes.shape({
        boardId: PropTypes.string.isRequired,
        versions: PropTypes.string.isRequired,
      }),
    }),
    comparinator: PropTypes.shape({}),
  };

  constructor(props) {
    super(props);
    this.boardId = this.props.match.params.boardId;
    this.versions = this.props.match.params.versions.split('/');
    this.toggleShowIssues = this.toggleShowIssues.bind(this);

    this.state = {
      showIssues: false,
    };
  }

  toggleShowIssues() {
    this.setState(state => ({
      ...state,
      showIssues: !state.showIssues,
    }));
  }

  componentDidMount() {
    this.props.getCompareVersions({ boardId: this.boardId, versions: this.versions });
  }

  componentWillReceiveProps(nextProps) {
    const versions = R.view(R.lensPath(['match', 'params', 'versions']));
    if (versions(this.props) !== versions(nextProps)) {
      this.props.getCompareVersions({
        boardId: this.boardId,
        versions: versions(nextProps).split('/'),
      });
    }
  }

  buildHeader(comparinator) {
    const e = comparinator ? (
      <React.Fragment>
        |{' '}
        <BoardLink
          href={getJiraBoardLink(comparinator.versions[0].boardData.boardId)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {comparinator.versions[0].boardData.backlogName}
        </BoardLink>
        <Helmet>
          <title>{comparinator.versions[0].boardData.backlogName}</title>
        </Helmet>
      </React.Fragment>
    ) : null;
    return (
      <Header>
        <Title>Comparinator {e}</Title>
      </Header>
    );
  }

  render() {
    const { comparinator } = this.props;

    if (comparinator.error) {
      return <Page header={this.buildHeader()}>{comparinator.error}</Page>;
    }

    if (comparinator.loading || comparinator.versions < 2) {
      return (
        <Page header={this.buildHeader()}>
          <SpinnerPanel />
        </Page>
      );
    }
    return (
      <Page header={this.buildHeader(comparinator)}>
        <Flexbox flexDirection="column">
          <VersionList
            showIssues={this.state.showIssues}
            onToggleShowIssues={this.toggleShowIssues}
            comparinator={this.props.comparinator}
          />
          <IssueList comparinator={this.props.comparinator} />
        </Flexbox>
      </Page>
    );
  }
}

export default withRouter(
  connect(
    getComparinator,
    { getCompareVersions }
  )(Comparinator)
);
