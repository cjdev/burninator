import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link as RRLink } from 'react-router-dom';
import {
  Link,
  LinkContentWrapper,
  SideNav,
} from '@cjdev/visual-stack-redux/lib/components/SideNav';
import { Logo, BoardsIcon, PlaninatorIcon, SettingsIcon } from '../../components/Icons';

const AppSideNavInternal = ({ history }) => (
  <SideNav
    initializedCollapsed={true}
    logo={<Logo onClick={() => history.push('/')} />}
    appName="burninator"
  >
    <Link hoverText="Boards">
      <RRLink to="/">
        <LinkContentWrapper
          icon={
            <div>
              <BoardsIcon />
            </div>
          }
          label="Boards"
        />
      </RRLink>
    </Link>
    {true && (
      <Link hoverText="Plans">
        <RRLink to="/plans">
          <LinkContentWrapper
            icon={
              <div>
                <PlaninatorIcon />
              </div>
            }
            label="Plans"
          />
        </RRLink>
      </Link>
    )}
    <Link hoverText="Settings">
      <RRLink to="/about">
        <LinkContentWrapper
          icon={
            <div>
              <SettingsIcon />
            </div>
          }
          label="Settings"
        />
      </RRLink>
    </Link>
  </SideNav>
);
AppSideNavInternal.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};
export const AppSideNav = withRouter(AppSideNavInternal);
