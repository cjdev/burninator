import React from 'react';
import styled from 'styled-components/macro';
import { Button } from '@cjdev/visual-stack/lib/components/Button';
import * as Icons from '../Icons';

export const BasicButton = props => <Button type="outline-secondary" {...props} />;

export const LinkButton = styled.button`
  text-decoration: none;
  cursor: pointer;
  color: ${({ theme }) => theme.a.color};
  background: transparent;
  border: 0;
  border-bottom: 1px solid transparent;
  padding: 0;
  text-transform: uppercase;
  &:hover {
    color: ${({ theme }) => theme.aHover.color};
    text-decoration: none;
    border-bottom: ${({ theme }) => theme.aHover.borderBottom};
  }
`;

const IconButton = props => <Button type="icon" {...props} />;

// eslint-disable-next-line react/prop-types
const makeIconButton = (icon, props) => ({ children, ...laterProps }) => (
  <IconButton {...props} {...laterProps}>
    {children}
    {React.createElement(icon)}
  </IconButton>
);

export const ExpandCollapseButton = makeIconButton(Icons.ExpandCollapseIcon);
export const CloseButton = makeIconButton(Icons.CloseIcon);
export const AlertButton = makeIconButton(Icons.AlertIcon);
export const RenameButton = makeIconButton(Icons.RenameBoxIcon);
export const ArchiveButton = makeIconButton(Icons.ArchiveIcon);
export const UnarchiveButton = makeIconButton(Icons.UnarchiveIcon);
export const SettingsButton = makeIconButton(Icons.SettingsIcon);
