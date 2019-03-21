import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars

export const NotesInput = ({ value, onChange }) => {
  return (
    <div>
      <textarea
        css={`
          height: 100px;
          padding: 8px;
          line-height: 1.2em;
        `}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
NotesInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
