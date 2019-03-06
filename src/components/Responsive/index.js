import React from 'react';
import PropTypes from 'prop-types';
import R from 'react-responsive';

const breakPoint = 1080;

export const Desktop = ({ children }) => <R minWidth={breakPoint} children={children} />;
Desktop.propTypes = {
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.array, PropTypes.node]),
};

export const Mobile = ({ children }) => <R maxWidth={breakPoint} children={children} />;
Mobile.propTypes = {
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.array, PropTypes.node]),
};

export const Responsive = R;
