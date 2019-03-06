import React from 'react';
import * as VSTable from '@cjdev/visual-stack/lib/components/Table';
import styled, { css } from 'styled-components/macro';

const debug = css`
  border: 1px solid black;
`;

const nowrap = css`
  white-space: nowrap;
`;
const wrap = css`
  white-space: normal;
`;

const CleanTable = ({ debug, fixed, ...props }) => <VSTable.Table {...props} />;
// prettier-ignore
export const Table = styled(CleanTable)`
  border-collapse: collapse;
  text-align: left;
  width: 100%;
  ${nowrap};

  ${({ fixed }) => fixed && 'table-layout: fixed;'};
  ${props => props.w && `width: ${props.w};`}
  ${props => props.minWidth && `min-width: ${props.w};`}
  ${props => props.nohover ? '' : '&& > tbody > tr:hover { background-color: #f0f0f0; }' }

  ${props => props.debug && `
    ${debug}
    & td, & th {
      ${debug}
    };
  `}
`;

const CleanTr = ({ complete, borderHover, excepted, noUnderline, override, ...props }) => (
  <VSTable.Tr {...props} />
);
// prettier-ignore
export const Tr = styled(CleanTr)`
  ${props => props.borderHover && `
    &:hover > td {
      border-top:    1px solid #ccc;
      border-bottom: 1px solid #ccc;
    }
    &:hover > td:first-of-type {
      border-left:   1px solid #ccc;
    }
    &:hover > td:last-of-type {
      border-right:  1px solid #ccc;
    }
  `}
  ${props => props.debug && `
    & > td, & > th {
      ${debug}
    }
  `}

  ${props => props.noUnderline && `
    & > td, & > th {
      border-top: 1px solid transparent;
    }
  `}

`;

const leftAlign = css`
  text-align: left;
`;
const centerAlign = css`
  text-align: center;
`;
const rightAlign = css`
  text-align: right;
`;
const bold = css`
  font-weight: 600;
`;
const faded = css`
  color: #bbb;
`;

// prettier-ignore
const cellCss = css`
  &.vs-cell {
    ${props => props.v ? `vertical-align: ${props.v}` : 'vertical-align: middle'};
    ${props => props.padding ? `padding: ${props.padding}` : 'padding: 4px 8px'};
    ${props => props.margin ? `margin: ${props.margin}` : 'margin: 0'};
    ${props => props.bold === true ? bold : undefined};
    ${props => props.faded && faded};
    ${props => props.nowrap && nowrap};
    ${props => props.normal && wrap};
    ${props => props.noselect && `user-select: none;`};
    ${props => props.bg && `background-color: ${props.bg};`}
    ${props => props.left && leftAlign};
    ${props => props.center && centerAlign};
    ${props => props.right && rightAlign};
    ${props => props.w && `width: ${props.w};`}
    ${props => props.min === 'true' ? `width: 1%;` : undefined}
    ${props => props.max === 'true' && `width: 100%;`}
    ${props => props.topline === 'off' && `border-top: 0 !important;`};
    ${props => props.pointer && ` cursor: pointer; `};
    ${props => props.ellipsis ? `
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 1px;
    ` : undefined};
    ${props => props.debug && debug};
  }
`;

const CleanTd = ({
  active,
  bold,
  description,
  ellipsis,
  index,
  left,
  last,
  min,
  normal,
  noselect,
  ...props
}) => <VSTable.Td {...props} />;
export const Td = styled(CleanTd)`
  ${cellCss};
`;

const CleanTh = ({ ellipsis, index, left, min, noselect, ...props }) => <VSTable.Th {...props} />;
export const Th = styled(CleanTh)`
  ${cellCss};
`;

export const right = comp =>
  styled(comp)`
    text-align: right;
    color: red !important;
  `;

export const left = comp =>
  styled(comp)`
    text-align: left;
  `;

export const THead = VSTable.THead;
export const TBody = VSTable.TBody;
