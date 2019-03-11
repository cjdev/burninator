import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro';
import { PageHeader, PageTitle } from '@cjdev/visual-stack/lib/components/PageHeader';
import PageContent from '@cjdev/visual-stack/lib/components/PageContent';

const Page = ({ children, header }) => (
  <div>
    {header}
    <PageContent>{children}</PageContent>
  </div>
);
Page.propTypes = {
  children: PropTypes.node,
  header: PropTypes.element,
};

const Header = ({ children }) => <PageHeader>{children}</PageHeader>;
Header.propTypes = {
  children: PropTypes.node,
};

const TitleChildWrapper = styled.div`
  font-variant: all-small-caps;
  font-size: 1.5em !important;
`;

const Title = ({ children }) => (
  <PageTitle>
    <TitleChildWrapper>{children}</TitleChildWrapper>
  </PageTitle>
);
Title.propTypes = {
  children: PropTypes.node,
};

export const HeaderRight = ({ children }) => {
  return (
    <div
      css={`
        margin-right: 16px;
      `}
    >
      {children}
    </div>
  );
};
HeaderRight.propTypes = {
  children: PropTypes.node,
};

export { Page, Header, Title };
