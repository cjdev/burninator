/* eslint-disable max-len, jsx-a11y/no-static-element-interactions */
import React, { useRef, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components/macro';

import { FullSyncButton } from '../../components/SyncLink';
import { Page, Header, Title } from '../../components/Page';
import { Panel, PanelTitle } from '../../components/Panel';
import { PanelSpinner } from '../../components/Spinner';

import { getResetBoard } from '../../state/actions';
import { Markdown } from './Markdown';
import trogdor from '../../trogdor.png';
import { JIRA_WEB_URL } from '../../utils';

const BurninatorUrl = 'http://gitlab.cj.com/cjdev/burninator';

const AddBoardPanel = ({ getResetBoard }) => {
  const [maybeBoardId, setMaybeBoardId] = useState(null);
  const boardInputRef = useRef(null);

  const parseBoardId = event => {
    const { value } = event.target;
    const m = value.match(/rapidView=(\d+)&/);
    if (Number(value)) {
      setMaybeBoardId(value);
    } else if (m && Number(m[1])) {
      setMaybeBoardId(m[1]);
    } else {
      setMaybeBoardId(null);
    }
  };

  return (
    <Panel>
      <PanelTitle>Adding A New Board</PanelTitle>
      <p>If you know the ID of the Jira board to add, type it in the input below.</p>
      <p>
        If not, go to the <a href={JIRA_WEB_URL}>Jira</a> page for the board and copy the url into
        the input below.
      </p>
      <p>Either way, make sure that the permissions for the board are set to "public".</p>
      <p>
        <BoardIdInput
          type="text"
          placeholder="Enter Id or Jira Url"
          name="boardId"
          ref={boardInputRef}
          onChange={parseBoardId}
        />
        <FullSyncButton
          buttonLabel={`Add Board ${maybeBoardId || '...'}`}
          onResetClick={() => {
            if (!maybeBoardId) return;
            getResetBoard({ boardId: maybeBoardId });
          }}
        />
      </p>
      <p>
        Note that adding a board will take a couple of minutes. Please be patient. Take a break. Go
        for a walk. Once done,{' '}
        <a href={`/board/${maybeBoardId || 'bemorepatient'}`}>click this link</a> to go to your
        board.
      </p>
    </Panel>
  );
};
AddBoardPanel.propTypes = {
  getResetBoard: PropTypes.func.isRequired,
};

const SecretMenuPanel = () => (
  <Panel>
    <PanelTitle>Secret Menu</PanelTitle>
    <PanelList>
      <PanelListItem>
        <PanelListItemLabel>v=[number]</PanelListItemLabel>
        Overrides the velocity, ignoring the history of the board. Defaults to off.
      </PanelListItem>
      <PanelListItem>
        <PanelListItemLabel>vl=[number]</PanelListItemLabel>
        Overrides the default number of past weeks used in the velocity calculation. Defaults to 12.
      </PanelListItem>
      <PanelListItem>
        <PanelListItemLabel>history=[true|false]</PanelListItemLabel>
        Displays history of each closed iteration. Defaults to false.
      </PanelListItem>
      <PanelListItem>
        <PanelListItemLabel>
          u=[0 {'<'} float {'<'} 1]
        </PanelListItemLabel>
        Overrides the default "Scope Growth Prediction". Defaults to 0.3.
      </PanelListItem>
    </PanelList>
  </Panel>
);

const AboutPanel = () => (
  <Panel>
    <PanelTitle>About Burninator {process.env.REACT_APP_VERSION}</PanelTitle>
    <p>
      Commit:{' '}
      <a href={`${BurninatorUrl}/commit/${process.env.REACT_APP_GIT_HASH}`}>
        {process.env.REACT_APP_GIT_HASH && process.env.REACT_APP_GIT_HASH}
      </a>
    </p>
    <p>
      Find a bug? Have a feature request? Click{' '}
      <a
        rel="noopener noreferrer"
        target="_blank"
        href="http://gitlab.cj.com/cjdev/burninator/issues"
      >
        here
      </a>{' '}
      to file an issue in Gitlab.
    </p>
  </Panel>
);

// eslint-disable-next-line no-unused-vars
const New = () => (
  <span
    style={{
      color: 'rgba(0, 175,102, 1)',
      display: 'inline-block',
      border: '1px solid rgba(0, 175,102, 1)',
      borderRadius: '2px',
      backgroundColor: 'rgba(0, 175,102, 0.2)',
      padding: '0 5px',
      margin: '0 5px',
      fontWeight: 600,
      fontSize: '1.1em',
    }}
  >
    NEW!
  </span>
);

const BoardIdInput = styled.input`
  width: 100%;
  padding: 3px 5px;
  margin-right: 5px;
  margin-left: 3px;
  font-size: 1em;
`;

const PanelList = styled.ul`
  list-style: none;
  padding: 0;
`;

const PanelListItem = styled.li`
  margin-bottom: 1em;
`;

const PanelListItemLabel = styled.span`
  font-weight: 600;
  display: block;
`;

const AboutPageContainer = styled.div`
  @media (min-width: 50em) {
    display: flex;
    justify-content: space-between;

    & > div:not(:first-child) {
      margin-left: 15px;
    }
  }
`;
const Left = styled.div`
  flex: 1;
`;
const Right = styled.div`
  flex: 1;
`;

const header = (
  <Header>
    <Helmet title="About" />
    <Title>About</Title>
  </Header>
);

const AboutPage = ({ getResetBoard, history }) => {
  const [changelogText, setChangelogText] = useState(null);
  useEffect(() => {
    fetch('/api/changelog')
      .then(res => res.text())
      .then(setChangelogText);
  }, []);
  return (
    <Page header={header}>
      <AboutPageContainer>
        <Left>
          <AddBoardPanel getResetBoard={getResetBoard} history={history} />
          <SecretMenuPanel />
        </Left>
        <Right>
          <AboutPanel />
          <Panel>
            <PanelTitle>Changeinator</PanelTitle>
            {changelogText ? <Markdown source={changelogText} /> : <PanelSpinner size={4} />}
          </Panel>
          <Panel>
            <PanelTitle>Why?</PanelTitle>
            <a
              href="https://www.youtube.com/watch?v=7gz1DIIxmEE"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={trogdor}
                alt="trogdor"
                css={`
                  height: 100px;
                `}
              />
            </a>
          </Panel>
        </Right>
      </AboutPageContainer>
    </Page>
  );
};
AboutPage.propTypes = {
  getResetBoard: PropTypes.func.isRequired,
  history: PropTypes.object,
};

class AP extends React.Component {
  state = {
    changelog: null,
    loading: false,
  };
  componentDidMount() {
    this.setState(s => ({
      ...s,
      loading: true,
    }));
    fetch('/api/changelog')
      .then(res => res.text())
      .then(changelog => {
        this.setState(state => ({
          ...state,
          loading: false,
          changelog,
        }));
      });
  }
  render() {
    return (
      <Page header={header}>
        <AboutPageContainer>
          <Left>
            <AddBoardPanel getResetBoard={this.props.getResetBoard} history={this.props.history} />
            <SecretMenuPanel />
          </Left>
          <Right>
            <AboutPanel />
            <Panel>
              <PanelTitle>Changeinator</PanelTitle>
              {this.state.loading ? 'Loading...' : <Markdown source={this.state.changelog} />}
            </Panel>
            <Panel>
              <PanelTitle>Why?</PanelTitle>
              <a
                href="https://www.youtube.com/watch?v=7gz1DIIxmEE"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={trogdor} alt="trogdor" />
              </a>
            </Panel>
          </Right>
        </AboutPageContainer>
      </Page>
    );
  }
}
AP.propTypes = {
  getResetBoard: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(
  connect(
    null,
    { getResetBoard }
  )(AboutPage)
);
