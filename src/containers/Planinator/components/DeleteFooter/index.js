import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { BasicButton } from '../../../../components/Button';
import * as M from '@cjdev/visual-stack/lib/components/Modal';

export const DeleteFooter = ({ onDelete }) => {
  return (
    <M.Footer>
      <div
        css={`
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #e1523d;
        `}
      >
        <span>Click to permanently delete this track. DANGER!</span>
        <BasicButton type="danger" onClick={onDelete}>
          Delete Forever
        </BasicButton>
      </div>
    </M.Footer>
  );
};
DeleteFooter.propTypes = {
  onDelete: PropTypes.func.isRequired,
};
