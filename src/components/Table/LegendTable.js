/* eslint-disable import/prefer-default-export */
import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components/macro';
import { Table as TTable, Td as TTd, Th as TTh, Tr as TTTr } from './';

export const Table = TTable;

const index = css`
  text-align: right;
`;

const active = css`
  border-left: 3px solid rgba(76, 175, 80, 0.7);
  background-color: rgba(76, 175, 80, 0.1);
`;

const activeFalse = css`
  border-left: 0px solid transparent;
`;

export const zeroPoints = css`
  border-left: 3px solid rgba(244, 67, 54, 0.3);
  background-color: rgba(244, 67, 54, 0.1);
`;

const cellCss = css`
  border: 0;
  ${props => props.index && index};
  ${props => props.min && 'width: 1px;'};
`;

export const Td = styled(TTd)`
  ${cellCss};
`;

export const Th = styled(TTh)`
  ${cellCss};
`;

export const TTr = styled(TTTr)`
  ${props => (props.active ? active : activeFalse)};
  ${props => props.points === 0 && zeroPoints};
`;

export const Tr = props => (
  <TTr {...props} noUnderline>
    {props.children}
  </TTr>
);
Tr.propTypes = {
  children: PropTypes.node,
};

const InnerTable = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  border-spacing: 0;
  border: 0;
  & td {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const TruncatingTd = ({ children, ...props }) => (
  <Td>
    <InnerTable>
      <tbody>
        <Tr>
          <td {...props}>{children}</td>
        </Tr>
      </tbody>
    </InnerTable>
  </Td>
);
TruncatingTd.propTypes = {
  children: PropTypes.node,
};
