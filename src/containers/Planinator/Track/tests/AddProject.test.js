import React from 'react';
import { AddProjectModal } from '../AddProject';
import PlaninatorContext from '../../context';
import { render } from '../../../../testing/testing-utils';

describe('<AddProjectModal />', () => {
  it('should render', () => {
    const props = {
      closeModal: () => {},
      track: {},
    };
    const contextValue = {
      state: {
        putApiMeta: {},
      },
    };
    const result = render(
      <PlaninatorContext.Provider value={contextValue}>
        <AddProjectModal {...props} />
      </PlaninatorContext.Provider>
    );
    expect(result).not.toBeNull();
  });
});
