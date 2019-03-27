import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { BasicButton } from '../../../../components/Button';
import * as M from '@cjdev/visual-stack/lib/components/Modal';

export const DeleteFooter = ({ onDelete, buttonText = 'Remove', ...props }) => {
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
        <span>Click to permanently remove this item from the plan</span>
        <BasicButton type="danger" onClick={onDelete} {...props}>
          {buttonText}
        </BasicButton>
      </div>
    </M.Footer>
  );
};
DeleteFooter.propTypes = {
  buttonText: PropTypes.string,
  onDelete: PropTypes.func.isRequired,
};
