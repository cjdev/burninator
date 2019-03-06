import React from 'react';
import styled from 'styled-components/macro';
import { PageLoadingIcon, LoadingIcon } from '../Icons';

export const Spinner = () => <LoadingIcon />;
export const PageSpinner = () => <PageLoadingIcon />;

const PanelSpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
`;
export const PanelSpinner = props => (
  <PanelSpinnerWrapper>
    <PageLoadingIcon {...props} />
  </PanelSpinnerWrapper>
);

const Wrapper = styled.div`
  border: 0px solid #ccc;
  display: flex;
  font-size: 5em;
  justify-content: space-around;
  align-items: center;
  height: 500px;
`;

export const SpinnerPanel = () => (
  <Wrapper>
    <PageSpinner />
  </Wrapper>
);
