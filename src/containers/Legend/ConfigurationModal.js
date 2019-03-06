import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import styled, { css } from 'styled-components/macro';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { openModal, closeModal } from '@cjdev/visual-stack-redux';
import { ModalMountPoint } from '@cjdev/visual-stack-redux/lib/components/Modal';
import * as M from '@cjdev/visual-stack/lib/components/Modal';
import { BasicButton } from '../../components/Button';
import * as Actions from '../../state/actions';
import { Spinner } from '../../components/Spinner';
import { getCurrentBoard } from '../../state/reducer';

const area = css`
  grid-area: ${({ area }) => area};
`;

const Hint = styled.span`
  ${area};
  font-style: italic;
`;

const Label = styled.label`
  ${area};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-weight: 600;
`;

const Input = styled.input`
  ${area};
  padding: 5px 3px;
  margin-right: 10px;
  margin-bottom: 5px !important;
  font-size: 1em;
  width: ${({ width }) => (width ? width : 'unset')};
  text-align: ${({ textAlign }) => (textAlign ? textAlign : 'inherit')};
  &::placeholder {
    color: #ccc;
  }
`;

const NumberInput = ({ width = '50px', ...rest }) => {
  return <Input type="number" width={width} {...rest} textAlign="right" />;
};
NumberInput.propTypes = {
  width: PropTypes.number,
};

const DD = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  & div {
    margin-right: 10px;
    margin-bottom: 3px;
  }
`;

//
// Generic container for input things
// only allows for an area definition
//
const InputAreaBase = styled.div`
  ${area};
`;

const HorizontalInputArea = styled(InputAreaBase)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const FormContainer = styled.div`
  display: grid;
  grid-gap: 25px 10px;
  grid-template-columns: auto 1fr;
  grid-template-areas:
    'velocity-label  velocity-input'
    'scope-label     scope-input'
    'stalled-label   stalled-input';
`;

class ModalDialog extends React.Component {
  static propTypes = {
    boardId: PropTypes.string.isRequired,
    closeModal: PropTypes.func.isRequired,
    currentBoard: PropTypes.shape({
      config: PropTypes.shape({
        velocity: PropTypes.string,
        scopeGrowth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      }),
      processed: PropTypes.shape({
        opts: PropTypes.shape({
          computedConfig: PropTypes.object,
        }),
      }),
      configuration: PropTypes.shape({
        loading: PropTypes.bool,
        error: PropTypes.string,
      }),
      loading: PropTypes.bool,
    }),
    fetchConfigVersion: PropTypes.func.isRequired,
    fetchConfigVersions: PropTypes.func.isRequired,
    updateConfiguration: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const config = props.currentBoard.processed.opts.computedConfig;
    this.state = {
      velocity: config.velocity.override.configured || '',
      scopeGrowth: config.scopeGrowth.configured || '',
      stalled: config.stalled || {},
    };
    this.originalConfig = this.state;
  }

  componentDidMount() {
    this.props.fetchConfigVersions(this.props.boardId);
    this.props.fetchConfigVersion(this.props.boardId, 'current');
  }

  componentWillReceiveProps(nextProps) {
    const { loading: nextLoading, error: nextError } = nextProps.currentBoard.configuration;
    const { loading } = this.props.currentBoard.configuration;

    const stoppedLoading = loading && !nextLoading;
    const completedSave = stoppedLoading && R.isNil(nextError);

    if (completedSave) {
      this.props.closeModal();
    }
  }

  isChanged = () => R.not(R.equals(this.originalConfig, this.state));

  handleVelocityChange = e => {
    const { value } = e.target;
    const asFloat = parseFloat(value);

    if (asFloat || value === '') {
      this.setState({
        velocity: value,
      });
    }
  };

  handleScopeGrowthChange = e => {
    const { value } = e.target;
    const asFloat = parseFloat(value);
    if ((asFloat < 1 && asFloat >= 0) || value === '' || value === '.') {
      this.setState({
        scopeGrowth: value,
      });
    }
  };

  handleStalledStoryChange = e => {
    const key = e.target.dataset.points;
    const asInt = parseInt(e.target.value, 10);
    this.setState(state => {
      return {
        ...state,
        stalled: {
          ...state.stalled,
          [key]: asInt,
        },
      };
    });
  };

  handleSave = () => {
    if (this.isChanged() && !this.props.currentBoard.loading) {
      this.props.updateConfiguration(this.props.boardId, this.state);
    }
  };

  render() {
    const { processed } = this.props.currentBoard;
    const config = processed.opts.computedConfig;
    const { loading, error } = this.props.currentBoard.configuration;
    return (
      <M.Modal onBackgroundClick={closeModal}>
        <M.Dialog>
          <M.Content>
            <M.Header title="Configure" />
            <M.Body>
              <FormContainer>
                <Label area="velocity-label">Velocity Prediction</Label>
                <HorizontalInputArea area="velocity-input">
                  <Input
                    ref={value => {
                      this.velocityInput = value;
                    }}
                    type="number"
                    name="velocity"
                    onChange={this.handleVelocityChange}
                    placeholder={processed.velocityData.naturalVelocity}
                    value={this.state.velocity}
                    width="100px"
                  />
                  <Hint>Must be a number > 0</Hint>
                </HorizontalInputArea>

                <Label area="scope-label">Scope Growth Prediction</Label>
                <HorizontalInputArea area="scope-input">
                  <Input
                    name="scopeGrowth"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    width="100px"
                    placeholder={config.scopeGrowth.default}
                    value={this.state.scopeGrowth}
                    onChange={this.handleScopeGrowthChange}
                  />
                  <Hint>Must be a decimal between 0 and 1</Hint>
                </HorizontalInputArea>

                <Label area="stalled-label">Stalled Story Configuration</Label>
                <HorizontalInputArea area="stalled-input">
                  {[1, 2, 3, 5, 8, 13].map(point => (
                    <DD key={point}>
                      <div>{point} pt</div>
                      <NumberInput
                        min="0"
                        name={`stall-${point}`}
                        value={this.state.stalled[point] || ''}
                        data-points={point}
                        onChange={this.handleStalledStoryChange}
                      />
                    </DD>
                  ))}
                </HorizontalInputArea>
              </FormContainer>
            </M.Body>
            <M.Footer>
              <span>{error}</span>
              <BasicButton type="text" onClick={() => this.props.closeModal()}>
                Cancel
              </BasicButton>
              <BasicButton
                type="outline-secondary"
                onClick={this.handleSave}
                disabled={!this.isChanged()}
              >
                Save
                {loading && <Spinner />}
              </BasicButton>
            </M.Footer>
          </M.Content>
        </M.Dialog>
      </M.Modal>
    );
  }
}

const ConfigModal = withRouter(
  connect(
    state => ({
      currentBoard: getCurrentBoard(state),
    }),
    dispatch => ({
      updateConfiguration: (boardId, config) =>
        dispatch(Actions.updateConfiguration(boardId, config)),
      fetchConfigVersions: boardId => dispatch(Actions.fetchConfigVersions(boardId)),
      fetchConfigVersion: (boardId, version) =>
        dispatch(Actions.fetchConfigVersion(boardId, version)),
    })
  )(ModalDialog)
);

// The openModal action takes the dialog component and its props
const ModalButton = ({ openModal, closeModal, boardId }) => (
  <span>
    <ModalMountPoint />
    <BasicButton onClick={() => openModal(ConfigModal, { closeModal, boardId })}>
      Configure
    </BasicButton>
  </span>
);
ModalButton.propTypes = {
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  boardId: PropTypes.string.isRequired,
};

// Hook up the actions to the button and dialog
const OpenModalButton = connect(
  null,
  { openModal, closeModal }
)(ModalButton);

export default OpenModalButton;
