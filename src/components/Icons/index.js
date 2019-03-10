import React from 'react';
import styled from 'styled-components/macro';
import { getTheme } from '../../themes';
import logoImg from '../../burndown.png';

import {
  mdiDeveloperBoard,
  mdiExclamation,
  mdiChartTimeline,
  mdiChevronDown,
  mdiChevronDoubleDown,
  mdiChevronDoubleUp,
  mdiChevronRight,
  mdiClose,
  mdiLoading,
  mdiPackageDown,
  mdiPackageUp,
  mdiRenameBox,
  mdiSettings,
  mdiUnfoldMoreHorizontal,
} from '@mdi/js';
import Icon from '@mdi/react';

const t = getTheme();
const defaults = {
  size: 1.5,
};

const makeIcon = (svg, makeProps = {}) => laterProps => (
  <Icon path={svg} {...defaults} {...makeProps} {...laterProps} />
);

export const AlertIcon = makeIcon(mdiExclamation, { color: t.issueList.red.color });
export const ArchiveIcon = makeIcon(mdiPackageDown);
export const BoardsIcon = makeIcon(mdiDeveloperBoard);
export const ChevronDownIcon = makeIcon(mdiChevronDown);
export const ChevronDoubleDownIcon = makeIcon(mdiChevronDoubleDown);
export const ChevronDoubleUpIcon = makeIcon(mdiChevronDoubleUp);
export const ChevronRightIcon = makeIcon(mdiChevronRight);
export const CloseIcon = makeIcon(mdiClose);
export const ExpandCollapseIcon = makeIcon(mdiUnfoldMoreHorizontal);
export const LoadingIcon = makeIcon(mdiLoading, { spin: 1 });
export const PageLoadingIcon = makeIcon(mdiLoading, { size: 7, spin: 1 });
export const PlaninatorIcon = makeIcon(mdiChartTimeline);
export const RenameBoxIcon = makeIcon(mdiRenameBox);
export const SettingsIcon = makeIcon(mdiSettings);
export const UnarchiveIcon = makeIcon(mdiPackageUp);

export const Logo = styled.span`
  display: inline-block;
  width: 24px;
  height: 24px;
  background-image: url(${logoImg});
  background-size: 24px;
  background-repeat: no-repeat;
  cursor: pointer;
  opacity: 1;
  margin: 0 5px;
  &:hover {
    opacity: 0.9;
  }
`;
