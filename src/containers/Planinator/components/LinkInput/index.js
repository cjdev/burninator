import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars

export const LinkInput = ({ value, onChange }) => {
  return (
    <div>
      <input placeholder="http://www.example.com" type="text" value={value} onChange={onChange} />
    </div>
  );
};
LinkInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
