import React from 'react';
import PropTypes from 'prop-types';
import * as T from '../../components/Table';

export const Td = props => (
  <T.Td {...props} margin="10px">
    {props.children}
  </T.Td>
);
Td.propTypes = {
  children: PropTypes.any,
};

export const Th = props => (
  <T.Th {...props} margin="10px">
    {props.children}
  </T.Th>
);
Th.propTypes = {
  children: PropTypes.any,
};

export const Tr = T.Tr;
export const Table = T.Table;
