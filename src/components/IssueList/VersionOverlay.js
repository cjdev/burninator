import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro';
import { Table, Th, Tr, Td } from '../Table';
import { Panel, PanelTitle } from '../Panel';
import { formatDate } from '../../utils';

const VOWrapper = styled.div`
  min-height: 100px;
  position: fixed;
  top: 52px;
  right: 18px;
`;
const CustomPanel = styled(Panel)`
  border-color: #ccc;
  border-width: 1px;
  background: #fefefe;
  box-shadow: 1px 1px 5px 0px rgba(0, 0, 0, 0.2);
`;
export const VersionOverlay = ({ versionData }) => {
  if (!versionData) return null;
  const {
    issues,
    issuesByStatus,
    totalPoints,
    totalPointsLeft,
    estDate,
    outsideDate,
  } = versionData;
  return (
    <VOWrapper>
      <CustomPanel>
        <PanelTitle>{versionData.name}</PanelTitle>
        <Table>
          <tbody>
            <Tr>
              <Th>Estimate</Th>
              <Td />
              <Td right>
                {formatDate(estDate)} - {formatDate(outsideDate)}
              </Td>
            </Tr>
            <Tr>
              <Th>Points</Th>
              <Td />
              <Td right>
                {totalPointsLeft} / {totalPoints}
              </Td>
            </Tr>
            <Tr>
              <Th>Issues</Th>
              <Th right>Total</Th>
              <Td right>{issues.length}</Td>
            </Tr>
            {issuesByStatus.map(i => (
              <Tr key={i.status}>
                <Td />
                <Th right>{i.status}</Th>
                <Td right>{i.count}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </CustomPanel>
    </VOWrapper>
  );
};
VersionOverlay.propTypes = {
  versionData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    issues: PropTypes.array.isRequired,
    estDate: PropTypes.string.isRequired,
    outsideDate: PropTypes.string.isRequired,
    totalPoints: PropTypes.number.isRequired,
    totalPointsLeft: PropTypes.number.isRequired,
    issuesByStatus: PropTypes.array.isRequired,
  }),
};
