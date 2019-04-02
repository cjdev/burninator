import React from 'react';
import { VersionList2 } from '../VersionList';
import { render } from '../../../testing/testing-utils';

describe('<VersionList2/>', () => {
  it('should render', () => {
    const props = {
      getBoard: () => {},
      getBoardVersions: () => {},
      match: {
        params: {
          boardId: '1234',
        },
      },
      history: {},
      location: {},
      currentBoard: {
        boardVersions: {},
      },
      comparinator: {
        comparinatorData: [],
        versions: [],
      },
      comparinatorData: [],
    };
    const result = render(<VersionList2 {...props} />);
    expect(result).not.toBeNull();
  });
});
