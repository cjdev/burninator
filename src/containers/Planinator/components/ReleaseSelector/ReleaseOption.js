import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line
import { tsToDateString } from '../../utils';

export class ReleaseOption extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }
  handleMouseDown(event) {
    event.preventDefault();
    event.stopPropagation();
    this.props.onSelect(this.props.option, event);
  }
  handleMouseMove(event) {
    if (this.props.isFocused) return;
    this.props.onFocus(this.props.option, event);
  }
  handleMouseEnter(event) {
    this.props.onFocus(this.props.option, event);
  }
  render() {
    const endDate = tsToDateString(this.props.option.endDateTs);
    return (
      <div
        className={this.props.className}
        css={`
          display: flex;
          justify-content: space-between;
        `}
        onMouseDown={this.handleMouseDown}
        onMouseEnter={this.handleMouseEnter}
        onMouseMove={this.handleMouseMove}
        title={this.props.option.title}
      >
        <span>{this.props.children}</span>
        <span>{endDate}</span>
      </div>
    );
  }
}
ReleaseOption.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  isFocused: PropTypes.bool,
  onFocus: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  option: PropTypes.object,
};
