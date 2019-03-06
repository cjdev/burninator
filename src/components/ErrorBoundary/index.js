import React from 'react';
import PropTypes from 'prop-types';
import { Page, Header, Title } from '../../components/Page/';
import { Panel, PanelTitle } from '../../components/Panel';

const header = (
  <Header>
    <Title>Error</Title>
  </Header>
);

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
  }

  render() {
    if (this.state.error !== null) {
      return (
        <Page header={header}>
          <Panel>
            <PanelTitle>Uh oh</PanelTitle>
            <h1>Something went very wrong. Check the console?</h1>
          </Panel>
        </Page>
      );
    }
    return this.props.children;
  }
}
ErrorBoundary.propTypes = {
  children: PropTypes.node,
};
